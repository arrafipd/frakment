import { ComponentPreviewTabs } from "@/components/docs/component-preview-tabs";
import { ComponentSource } from "@/components/docs/component-source";
import { getRegistryComponent } from "@/lib/registry";

interface ComponentPreviewProps {
  /** Alignment konten preview */
  align?: "center" | "start" | "end";
  /** Backward compat: children dirender langsung sebagai preview */
  children?: React.ReactNode;
  className?: string;
  /** Sembunyikan tab Code — hanya tampilkan preview */
  hideCode?: boolean;
  /** Nama komponen di registry — dipakai untuk mencari source code */
  name: string;
  previewClassName?: string;
  /** Opsional: path file sumber jika berbeda dari default registry */
  src?: string;
  /** Opsional: judul file yang tampil di atas blok kode */
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
