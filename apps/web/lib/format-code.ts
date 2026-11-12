import type { SourceFile } from "ts-morph";
import { Project, ScriptKind } from "ts-morph";

type DisplayTransformer = (opts: {
  filename: string;
  raw: string;
  sourceFile: SourceFile;
}) => Promise<unknown>;

export const formatCode = async (code: string) => {
  let formattedCode = code;

  // Ubah default export menjadi named export agar tidak bentrok saat ditampilkan
  formattedCode = formattedCode.replaceAll("export default", "export");

  try {
    const project = new Project({ compilerOptions: {} });
    const sourceFile = project.createSourceFile(
      "component.tsx",
      formattedCode,
      {
        scriptKind: ScriptKind.TSX,
      }
    );
    const transformers: DisplayTransformer[] = [];

    await Promise.all(
      transformers.map((transformer) =>
        transformer({
          filename: "component.tsx",
          raw: formattedCode,
          sourceFile,
        })
      )
    );

    return sourceFile.getText().trim();
  } catch (error) {
    console.error("Transform failed:", error);
    return code;
  }
};
