import fs from "node:fs";
import path from "node:path";
import { compile } from "@mdx-js/mdx";
import * as ts from "typescript";

interface ApiAuditIssue {
  code: string;
  file: string;
  message: string;
}

interface ApiRow {
  name: string;
  option: string | null;
  required: boolean;
  type: string | null;
}

interface MdxNode {
  attributes?: unknown[];
  children?: unknown[];
  name?: string;
  type?: string;
}

interface PropDefinition {
  optional: boolean;
  type: ts.Type;
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const readStaticString = (value: ts.Expression): string | null =>
  ts.isStringLiteral(value) || ts.isNoSubstitutionTemplateLiteral(value)
    ? value.text
    : null;

const hasFlag = (value: number, flag: number): boolean => {
  // biome-ignore lint/suspicious/noBitwiseOperators: TypeScript represents flags as bitmasks.
  return (value & flag) !== 0;
};

const getObjectProperty = (
  object: ts.ObjectLiteralExpression,
  name: string
): ts.Expression | null => {
  const property = object.properties.find(
    (item): item is ts.PropertyAssignment =>
      ts.isPropertyAssignment(item) &&
      ((ts.isIdentifier(item.name) && item.name.text === name) ||
        (ts.isStringLiteral(item.name) && item.name.text === name))
  );
  return property?.initializer ?? null;
};

const parseApiRows = (expression: string): ApiRow[] | null => {
  const sourceFile = ts.createSourceFile(
    "props-table.tsx",
    `const __rows = ${expression};`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX
  );
  const declaration = sourceFile.statements.find(ts.isVariableStatement)
    ?.declarationList.declarations[0];
  if (
    !(
      declaration?.initializer &&
      ts.isArrayLiteralExpression(declaration.initializer)
    )
  ) {
    return null;
  }

  const rows: ApiRow[] = [];
  for (const element of declaration.initializer.elements) {
    if (!ts.isObjectLiteralExpression(element)) {
      continue;
    }
    const nameExpression = getObjectProperty(element, "name");
    const typeExpression = getObjectProperty(element, "type");
    if (!(nameExpression && ts.isStringLiteral(nameExpression))) {
      continue;
    }
    const [name, ...optionParts] = nameExpression.text.split(/\s+/u);
    const requiredExpression = getObjectProperty(element, "required");
    rows.push({
      name,
      option: optionParts.length > 0 ? optionParts.join(" ") : null,
      required: requiredExpression?.kind === ts.SyntaxKind.TrueKeyword,
      type: typeExpression ? readStaticString(typeExpression) : null,
    });
  }
  return rows;
};

const getPropsTableExpressions = async (
  content: string
): Promise<{ expressions: string[]; parseError: string | null }> => {
  const expressions: string[] = [];
  const visit = (node: unknown) => {
    if (!isRecord(node)) {
      return;
    }
    const mdxNode = node as MdxNode;
    if (
      (mdxNode.type === "mdxJsxFlowElement" ||
        mdxNode.type === "mdxJsxTextElement") &&
      mdxNode.name === "PropsTable" &&
      Array.isArray(mdxNode.attributes)
    ) {
      const rows = mdxNode.attributes.find(
        (attribute) =>
          isRecord(attribute) &&
          attribute.type === "mdxJsxAttribute" &&
          attribute.name === "rows"
      );
      if (isRecord(rows) && isRecord(rows.value)) {
        const value = rows.value;
        if (
          value.type === "mdxJsxAttributeValueExpression" &&
          typeof value.value === "string"
        ) {
          expressions.push(value.value);
        }
      }
    }
    if (Array.isArray(mdxNode.children)) {
      mdxNode.children.forEach(visit);
    }
  };
  const plugin = () => (tree: unknown) => visit(tree);

  try {
    await compile(content, { remarkPlugins: [plugin] });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { expressions, parseError: message };
  }
  return { expressions, parseError: null };
};

const normalizeTypeParts = (members: string[]): string => {
  const uniqueMembers = [...new Set(members)].sort();
  if (uniqueMembers.includes("false") && uniqueMembers.includes("true")) {
    return [
      ...uniqueMembers.filter(
        (member) => member !== "false" && member !== "true"
      ),
      "boolean",
    ]
      .sort()
      .join("|");
  }
  return uniqueMembers.join("|");
};

const simpleTypeName = (
  type: ts.Type,
  checker: ts.TypeChecker
): string | null => {
  if (type.isUnion()) {
    const members = type.types
      .filter((member) => member.flags !== ts.TypeFlags.Undefined)
      .map((member) => simpleTypeName(member, checker));
    if (members.some((member) => member === null)) {
      return null;
    }
    return normalizeTypeParts(members as string[]);
  }
  if (type.flags === ts.TypeFlags.StringLiteral) {
    return (type as ts.StringLiteralType).value;
  }
  if (type.flags === ts.TypeFlags.NumberLiteral) {
    return String((type as ts.NumberLiteralType).value);
  }
  if (type.flags === ts.TypeFlags.BooleanLiteral) {
    return type.intrinsicName;
  }
  if (type.flags === ts.TypeFlags.String) {
    return "string";
  }
  if (type.flags === ts.TypeFlags.Number) {
    return "number";
  }
  if (type.flags === ts.TypeFlags.Boolean) {
    return "boolean";
  }
  if (type.flags === ts.TypeFlags.Null) {
    return "null";
  }
  if (type.flags === ts.TypeFlags.Undefined) {
    return "undefined";
  }
  const symbolName = type.getSymbol()?.getName();
  if (symbolName === "Array" || symbolName === "ReadonlyArray") {
    const elementType = checker.getIndexTypeOfType(type, ts.IndexKind.Number);
    const elementName = elementType
      ? simpleTypeName(elementType, checker)
      : null;
    return elementName ? `${elementName}[]` : null;
  }
  return null;
};

const normalizeDocType = (type: string, optional = false): string => {
  const members = type
    .split("|")
    .map((part) =>
      part
        .trim()
        .replace(/^readonly\s+/u, "")
        .replace(/^["']|["']$/gu, "")
    )
    .filter(
      (part) => part && part !== "undefined" && !(optional && part === "null")
    );
  return normalizeTypeParts(members);
};

const isComparableDocType = (type: string): boolean =>
  /^(?:["'][^"']+["']|[\w.-]+(?:\[\])?|readonly\s+[\w.-]+\[\])(?:\s*\|\s*(?:["'][^"']+["']|[\w.-]+(?:\[\])?|readonly\s+[\w.-]+\[\]))*$/u.test(
    type.trim()
  );

const collectProps = (
  type: ts.Type,
  checker: ts.TypeChecker,
  definitions: Map<string, PropDefinition[]>,
  visited: Set<ts.Type>
) => {
  if (visited.has(type)) {
    return;
  }
  visited.add(type);

  if (type.isUnion() || type.isIntersection()) {
    for (const member of (type as ts.UnionOrIntersectionType).types) {
      collectProps(member, checker, definitions, visited);
    }
    return;
  }

  for (const property of checker.getPropertiesOfType(type)) {
    const location = property.valueDeclaration ?? property.declarations?.[0];
    if (!location) {
      continue;
    }
    const propertyType = checker.getTypeOfSymbolAtLocation(property, location);
    const candidates = definitions.get(property.name) ?? [];
    candidates.push({
      optional: hasFlag(property.flags, ts.SymbolFlags.Optional),
      type: propertyType,
    });
    definitions.set(property.name, candidates);
  }
};

const createRegistryProgram = (
  appRoot: string,
  platform: "web" | "native"
): { program: ts.Program | null; error: string | null } => {
  const configPath = path.join(appRoot, "tsconfig.json");
  const config = ts.readConfigFile(configPath, ts.sys.readFile);
  if (config.error) {
    return {
      error: ts.flattenDiagnosticMessageText(config.error.messageText, "\n"),
      program: null,
    };
  }
  const parsed = ts.parseJsonConfigFileContent(
    config.config,
    ts.sys,
    appRoot,
    undefined,
    configPath
  );
  const registryDirectory = path.join(appRoot, "registry");
  const sourcePaths = fs
    .readdirSync(registryDirectory)
    .filter((name) => name.endsWith(".tsx"))
    .map((name) => path.join(registryDirectory, name));
  const globalTypes = parsed.fileNames.filter((name) => name.endsWith(".d.ts"));
  return {
    error: null,
    program: ts.createProgram(
      [...new Set([...sourcePaths, ...globalTypes])],
      parsed.options
    ),
  };
};

const getSourceProps = (
  program: ts.Program,
  sourcePath: string,
  platform: "web" | "native"
): {
  checker: ts.TypeChecker | null;
  definitions: Map<string, PropDefinition[]>;
  error: string | null;
} => {
  const sourceFile = program.getSourceFile(sourcePath);
  if (!sourceFile) {
    return {
      checker: null,
      definitions: new Map(),
      error: `Registry source does not exist: ${sourcePath}`,
    };
  }
  const checker = program.getTypeChecker();
  const definitions = new Map<string, PropDefinition[]>();
  const propsDeclarations = sourceFile.statements.filter((statement) => {
    if (
      ts.isInterfaceDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement)
    ) {
      return statement.name.text.endsWith("Props");
    }
    return false;
  });

  for (const declaration of propsDeclarations) {
    collectProps(
      checker.getTypeAtLocation(declaration),
      checker,
      definitions,
      new Set()
    );
  }

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (moduleSymbol) {
    for (const exported of checker.getExportsOfModule(moduleSymbol)) {
      if (!/^[A-Z]/u.test(exported.getName())) {
        continue;
      }
      const exportedType = checker.getTypeOfSymbolAtLocation(
        exported,
        exported.valueDeclaration ?? sourceFile
      );
      const signatures = checker.getSignaturesOfType(
        exportedType,
        ts.SignatureKind.Call
      );
      for (const signature of signatures) {
        const parameter = signature.getParameters()[0];
        if (parameter) {
          collectProps(
            checker.getTypeOfSymbolAtLocation(
              parameter,
              parameter.valueDeclaration ?? sourceFile
            ),
            checker,
            definitions,
            new Set()
          );
        }
      }
    }
  }

  return {
    checker,
    definitions,
    error:
      definitions.size === 0
        ? `No *Props type found in ${platform} registry source.`
        : null,
  };
};

const sourceFileForComponent = (
  repoRoot: string,
  platform: "web" | "native",
  componentName: string
): string =>
  path.join(repoRoot, "apps", platform, "registry", `${componentName}.tsx`);

export const auditComponentApiTables = async (
  repoRoot: string,
  docsFiles: string[]
): Promise<ApiAuditIssue[]> => {
  const issues: ApiAuditIssue[] = [];
  const programs = new Map<"web" | "native", ts.Program>();
  for (const docPath of docsFiles) {
    const docsRelativePath = path
      .relative(path.join(repoRoot, "apps/web/content/docs"), docPath)
      .replace(/\\/gu, "/");
    const page = docsRelativePath.match(
      /^components\/(web|native)\/([^/]+)\.mdx$/u
    );
    if (!(page && fs.readFileSync(docPath, "utf8").includes("<PropsTable"))) {
      continue;
    }

    const platform = page[1] as "web" | "native";
    const componentName = page[2];
    const sourcePath = sourceFileForComponent(
      repoRoot,
      platform,
      componentName
    );
    const file = path.relative(repoRoot, docPath).replace(/\\/gu, "/");
    const content = fs.readFileSync(docPath, "utf8");
    const parsedTables = await getPropsTableExpressions(content);
    if (parsedTables.parseError) {
      issues.push({
        code: "api-doc-parse-error",
        file,
        message: `Could not parse MDX API table: ${parsedTables.parseError}`,
      });
      continue;
    }

    const documentedRows = parsedTables.expressions.flatMap((expression) => {
      const rows = parseApiRows(expression);
      if (!rows) {
        issues.push({
          code: "api-table-not-static",
          file,
          message:
            "PropsTable rows must be a static array to verify against source.",
        });
        return [];
      }
      return rows;
    });
    if (documentedRows.length === 0) {
      continue;
    }

    let program = programs.get(platform);
    if (!program) {
      const created = createRegistryProgram(
        path.join(repoRoot, "apps", platform),
        platform
      );
      if (!created.program) {
        issues.push({
          code: "api-source-unavailable",
          file,
          message: created.error ?? "Could not create TypeScript program.",
        });
        continue;
      }
      program = created.program;
      programs.set(platform, program);
    }
    const { checker, definitions, error } = getSourceProps(
      program,
      sourcePath,
      platform
    );
    if (error || !fs.existsSync(sourcePath)) {
      issues.push({
        code: "api-source-unavailable",
        file,
        message: error ?? `Registry source not found: ${sourcePath}`,
      });
      continue;
    }

    for (const row of documentedRows) {
      const candidates = definitions.get(row.name);
      if (!candidates?.length) {
        if (platform === "web" && row.name.startsWith("data-")) {
          continue;
        }
        issues.push({
          code: "api-prop-not-in-source",
          file,
          message: `API table documents "${row.name}", which is not declared by the component's Props types.`,
        });
        continue;
      }

      if (row.type && checker) {
        const documentedType = normalizeDocType(row.type);
        const sourceTypes = (candidates ?? [])
          .map(({ optional, type }) => {
            const simple = simpleTypeName(type, checker);
            return simple ? normalizeDocType(simple, optional) : null;
          })
          .filter((type): type is string => type !== null);
        const specificSourceTypes = sourceTypes.filter((type, index) => {
          const members = new Set(type.split("|"));
          return !sourceTypes.some((other, otherIndex) => {
            if (otherIndex === index) {
              return false;
            }
            const otherMembers = other.split("|");
            return (
              otherMembers.length < members.size &&
              otherMembers.every((member) => members.has(member))
            );
          });
        });
        const combinedSourceType = normalizeTypeParts(
          (specificSourceTypes.length > 0
            ? specificSourceTypes
            : sourceTypes
          ).flatMap((type) => type.split("|"))
        );
        if (row.option) {
          if (
            sourceTypes.length > 0 &&
            !specificSourceTypes.some((type) =>
              type.split("|").includes(documentedType)
            ) &&
            !combinedSourceType.split("|").includes(documentedType)
          ) {
            issues.push({
              code: "api-prop-option-mismatch",
              file,
              message: `API table documents "${row.name}" option "${documentedType}", which is not supported by the source type.`,
            });
          }
          continue;
        }
        if (
          isComparableDocType(row.type) &&
          sourceTypes.length > 0 &&
          !sourceTypes.includes(documentedType) &&
          combinedSourceType !== documentedType
        ) {
          issues.push({
            code: "api-prop-type-mismatch",
            file,
            message: `API table type "${row.type}" for "${row.name}" does not match source type(s): ${[...new Set(sourceTypes)].join("; ")}.`,
          });
        }
      }

      const optionalStates = [
        ...new Set(candidates.map(({ optional }) => optional)),
      ];
      if (optionalStates.length === 1 && row.required === optionalStates[0]) {
        issues.push({
          code: "api-prop-requiredness-mismatch",
          file,
          message: `API table requiredness for "${row.name}" does not match the source declaration.`,
        });
      }
    }
  }
  return issues;
};
