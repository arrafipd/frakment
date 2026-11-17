import type { Metadata } from "next";

import { Analytics } from "@/components/site/analytics";
import { ThemeProvider } from "@/components/site/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { fontVariables } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { JsonLdScripts } from "@/seo/json-ld";

import "@/styles/globals.css";
import { baseMetadata } from "@/seo/metadata";

export const metadata: Metadata = baseMetadata;

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="en" suppressHydrationWarning>
    <head>
      <JsonLdScripts />
    </head>
    <body
      className={cn(
        "bg-background text-foreground group/body overscroll-none font-sans antialiased [--footer-height:--spacing(14)] [--header-height:--spacing(14)] xl:[--footer-height:--spacing(24)]",
        fontVariables
      )}
    >
      <ThemeProvider>
        <TooltipProvider>
          {children}
          <Toaster />
          <Analytics />
        </TooltipProvider>
      </ThemeProvider>
    </body>
  </html>
);

export default RootLayout;
