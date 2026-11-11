import { CommandBox } from "@/components/command-box";
import { HomeCtas } from "@/components/home-ctas";
import HomeDemoStage from "@/components/home-demo-stage";
import { PageTransition } from "@/components/page-transition";
import { ROUTES } from "@/constants/routes";
import { BreadcrumbJsonLd } from "@/seo/json-ld";

export const dynamic = "force-static";
export const revalidate = false;

export default function IndexPage() {
  return (
    <>
      <BreadcrumbJsonLd items={[{ name: "Home", path: ROUTES.HOME }]} />
      <PageTransition>
        <section className="container-wrapper relative">
          <div className="container flex max-w-170 flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
            <h1 className="text-foreground max-w-72.5 text-2xl font-semibold sm:max-w-full">
              The Fragments behind your Design System.
            </h1>

            <p className="text-muted-foreground max-w-md text-sm leading-tight text-pretty">
              Components drop in from the registry directly, adapt to your theme
              natively, and move with your interface smoothly.
            </p>

            <CommandBox className="mt-4 w-full max-w-xl" />

            <HomeCtas className="mt-4" />
          </div>
        </section>

        <section className="w-full">
          <HomeDemoStage />
        </section>
      </PageTransition>
    </>
  );
}
