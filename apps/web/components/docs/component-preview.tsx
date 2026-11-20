import { ComponentPreviewTabs } from "@/components/docs/component-preview-tabs";
import { ComponentSource } from "@/components/docs/component-source";
import { getRegistryComponent } from "@/lib/registry";

interface ComponentPreviewProps {
  align?: "center" | "start" | "end";

  children?: React.ReactNode;
  className?: string;

  hideCode?: boolean;

  name: string;
  previewClassName?: string;

  src?: string;

  title?: string;
}

export async function ComponentPreview({
  name,
  title,
  src,
  className,
  previewClassName,
  hideCode = false,
  align = "center",
  children,
}: ComponentPreviewProps) {
  const Component = getRegistryComponent(name, "default");
  const previewNode = children ?? (Component ? <Component /> : null);

  if (!previewNode) {
    return (
      <div className="text-muted-foreground my-4 rounded-md border border-dashed p-6 text-center text-sm">
        Component <code className="font-mono text-xs">{name}</code> tidak
        ditemukan di registry.
      </div>
    );
  }

  return (
    <ComponentPreviewTabs
      align={align}
      className={className}
      component={previewNode}
      hideCode={hideCode}
      previewClassName={previewClassName}
      source={<ComponentSource name={name} src={src} title={title} />}
    />
  );
}
