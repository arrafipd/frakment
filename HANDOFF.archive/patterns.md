↑ [Back to HANDOFF](../HANDOFF.md) · → [Archive README](./README.md)

# Patterns — MDX, Demo, Meta, PowerShell

Canonical recipes referenced by `HANDOFF.md`. Grep here when writing new pages or demos.

---

## Patterns (WAJIB IKUTI)

### 1. Write/read file (PowerShell)

JANGAN pakai `Get-Content` / `Set-Content` untuk file dengan emoji atau non-ASCII. Selalu:

```powershell
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$path", $content, $utf8)
$c = [System.IO.File]::ReadAllText($path, $utf8)
```

Untuk file panjang, pakai array of lines (hindari here-string cutoff):

```powershell
$lines = @(
  'line 1',
  'line 2'
)
[System.IO.File]::WriteAllLines($path, $lines, $utf8)
```

### 2. MDX rich format (template)

````mdx
---
title: ComponentName
description: One-line description.
---

import { ComponentNameDemo } from "@/examples/component-name-demo";

<ComponentPreview
  name="component-name"
  title="component-name.tsx"
  previewClassName="h-auto py-8"
>
  <ComponentNameDemo />
</ComponentPreview>

Brief intro paragraph.

##### Installation

<CodeTabs>
  <TabsList>
    <TabsTrigger value="cli">Command</TabsTrigger>
    <TabsTrigger value="manual">Manual</TabsTrigger>
  </TabsList>

  <TabsContent value="cli">

```bash
npx frakment add component-name
```
````

  </TabsContent>

  <TabsContent value="manual">
    <Steps className="mb-0 pt-2">
      <Step>Install the following dependencies:</Step>
      ```bash
      npm install <deps>
      ```
      <Step>Copy and paste the following code into your project.</Step>
      <ComponentSource name="component-name" title="components/ui/component-name.tsx" />
      <Step>Update the import paths to match your project setup.</Step>
    </Steps>
  </TabsContent>
</CodeTabs>

##### Usage

```tsx title="component-name.tsx"
import { ComponentName } from "@/components/ui/component-name";
```

##### Anatomy

```tsx
<ComponentName>
  <ComponentNamePart />
</ComponentName>
```

- **ComponentName** - short description

##### Examples

### Variant A

<ComponentPreview name="component-name" title="component-name.tsx" previewClassName="h-auto py-8">
  <ComponentNameVariant />
</ComponentPreview>

##### API Reference

<PropsTable
rows={[
{
name: "variant",
type: '"a" | "b"',
defaultValue: '"a"',
description: "Visual variant.",
},
]}
/>

````

### 3. Demo file format

```tsx
"use client";

import { SomeIcon } from "@/lib/icons";  // ALWAYS use shim
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ComponentNameDemo() {
  return (
    <div className="w-full max-w-xs">
      <Field>
        <FieldLabel htmlFor="demo-id">Label</FieldLabel>
        <Input id="demo-id" placeholder="..." />
        <FieldDescription>Helper text.</FieldDescription>
      </Field>
    </div>
  );
}
````

Aturan: WAJIB `"use client"` kalau ada state/event. Icons dari `@/lib/icons`. Root wrapper `max-w-xs` (input) / `max-w-sm` (form) / `max-w-md` (rich). Props hardcoded (demo showcase).

### 4. Icon shim (`lib/icons.ts`)

File ini = Lucide-compatible shim di atas Phosphor. Setiap icon baru di-add di sini dulu.

Format:

```
IconName,
IconName as IconNameIcon,
```

Import dari `@/lib/icons`, bukan `@phosphor-icons/react` langsung.

Icons yang sudah ada di shim:

- `Check`, `CheckIcon`
- `ArrowDown`, `ArrowDownIcon`
- `ArrowUp`, `ArrowUpIcon`
- `ArrowClockwise`, `ArrowClockwiseIcon`
- `ArrowUpRight`, `ArrowUpRightIcon`
- `ChevronDown`, `ChevronDownIcon`
- `ChevronUp`, `ChevronUpIcon`
- `Plus`, `PlusIcon`
- `Paperclip`, `Image`, `Globe`, `Cloud`, `Bell`
- `Envelope`, `MailIcon`
- `CreditCard`, `EyeClosed`, `EyeOffIcon`
- `Star`, `Minus`
- `ArrowsClockwise`, `RefreshCcwIcon`
- `Folder`
- `Binoculars` (used as TelescopeIcon)
- `ChatTeardropDots` (used as MessageCircleDashedIcon)

### 5. Registry entry (`frakment.json`)

```json
{
  "name": "component-name",
  "version": "0.1.0",
  "title": "Component Name",
  "description": "One-line description",
  "source": "registry/component-name.tsx",
  "target": "components/ui/component-name.tsx",
  "dependencies": ["class-variance-authority", "radix-ui"],
  "registryDependencies": ["button"]
}
```

Setelah edit, `npm run registry:build`. Generate `public/r/*.json` + update `index.json` + rebuild SKILL.md.

### 6. Meta.json (navigation)

`content/docs/components/meta.json` mengontrol urutan sidebar:

```json
{
  "title": "Components",
  "root": true,
  "pages": [
    "avatar",
    "badge",
    "button",
    "checkbox",
    "code-block",
    "empty",
    "field",
    "input",
    "input-group",
    "item",
    "label",
    "select",
    "separator",
    "switch",
    "textarea"
  ]
}
```

Setelah edit:

```powershell
Remove-Item -Recurse -Force .source -ErrorAction SilentlyContinue
npx fumadocs-mdx
```

---
