interface PropRow {
  default?: string;
  description: string;
  name: string;
  required?: boolean;
  type: string;
}

interface PropsTableProps {
  rows: PropRow[];
}

export function PropsTable({ rows }: PropsTableProps) {
  return (
    <div className="my-6 w-full overflow-x-auto rounded-lg border">
      <table className="w-full caption-bottom text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-muted-foreground h-10 px-4 text-left align-middle text-xs font-semibold tracking-wide uppercase">
              Prop
            </th>
            <th className="text-muted-foreground h-10 px-4 text-left align-middle text-xs font-semibold tracking-wide uppercase">
              Type
            </th>
            <th className="text-muted-foreground h-10 px-4 text-left align-middle text-xs font-semibold tracking-wide uppercase">
              Default
            </th>
            <th className="text-muted-foreground h-10 px-4 text-left align-middle text-xs font-semibold tracking-wide uppercase">
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              className="hover:bg-muted/30 border-b transition-colors last:border-0"
              key={row.name}
            >
              <td className="px-4 py-3 align-middle">
                <code className="font-mono text-sm font-medium">
                  {row.name}
                </code>
                {row.required && (
                  <span aria-label="required" className="text-destructive ml-1">
                    *
                  </span>
                )}
              </td>
              <td className="px-4 py-3 align-middle">
                <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                  {row.type}
                </code>
              </td>
              <td className="px-4 py-3 align-middle">
                {row.default ? (
                  <code className="bg-muted rounded px-1.5 py-0.5 font-mono text-xs">
                    {row.default}
                  </code>
                ) : (
                  <span className="text-muted-foreground text-sm">—</span>
                )}
              </td>
              <td className="text-muted-foreground px-4 py-3 align-middle text-sm">
                {row.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
