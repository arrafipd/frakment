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
          <div className="container flex flex-col max-w-170 items-center gap-4 py-16 text-center md:py-20 lg:py-24">
            <h1 className="max-w-72.5 sm:max-w-full text-foreground text-2xl font-semibold">
              Fabric for interfaces in the age of agents.
            </h1>

            <p className="max-w-md text-sm text-pretty text-muted-foreground leading-tight">
              From an agent&apos;s first chat message to its millionth
              production render, Frakment is the thread in between: neutral by
              nature, precise by design, and copy-pasted from one registry.
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
