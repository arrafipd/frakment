import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WebMcpTools } from "@/components/site/web-mcp-tools";
import { agentDocsDirectiveText } from "@/lib/agent-discovery/directive";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background relative flex min-h-svh flex-col">
      <blockquote className="sr-only">{agentDocsDirectiveText}</blockquote>
      <WebMcpTools />
      <SiteHeader />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
    </div>
  );
}
