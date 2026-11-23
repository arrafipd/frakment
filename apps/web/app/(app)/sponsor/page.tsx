import type { Metadata } from "next";
import { PageTransition } from "@/components/docs/page-transition";
import { ExternalLinkButton } from "@/components/site/external-link-button";
import { UserAvatar } from "@/components/site/user-avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LINK } from "@/config/links";
import { ROUTES } from "@/config/routes";
import { createPageMetadata } from "@/features/seo/metadata";
import { getContributors } from "@/lib/github";
import { Star } from "@/lib/icons";
import { sponsors } from "@/lib/sponsors";

export const metadata: Metadata = createPageMetadata({
  description:
    "Support Frakment, an open-source registry of reusable React web and Expo-native components.",
  path: ROUTES.SPONSOR,
  title: "Sponsor",
});

const maxSponsors = 12;
const maxContributors = 30;

const SponsorPage = async () => {
  const contributors = await getContributors();

  const visibleSponsors = sponsors.slice(0, maxSponsors);
  const extraSponsors = sponsors.length - visibleSponsors.length;
  const visibleContributors = contributors.slice(0, maxContributors);
  const extraContributors = contributors.length - visibleContributors.length;

  return (
    <PageTransition>
      <section className="container-wrapper relative">
        <div className="container flex max-w-170 flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
          <h1 className="text-foreground max-w-72.5 text-2xl font-semibold sm:max-w-full">
            Support Frakment
          </h1>
          <p className="text-muted-foreground max-w-md text-sm leading-tight text-pretty">
            Frakment is an open-source registry of reusable React web and
            Expo-native components.
          </p>
          <p className="text-muted-foreground max-w-md text-sm leading-tight text-pretty">
            Sponsorships fund maintenance, new components, and infrastructure.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <ExternalLinkButton href={LINK.GITHUB} size="lg" variant="outline">
              <Star />
              Star on GitHub
            </ExternalLinkButton>
          </div>
        </div>
      </section>

      {sponsors.length > 0 && (
        <section className="container-wrapper relative">
          <div className="container mx-auto flex max-w-2xl flex-col items-center gap-3">
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Sponsors
            </p>
            <div className="flex max-w-lg flex-wrap justify-center gap-y-1">
              {visibleSponsors.map((s, i) => (
                <Tooltip key={s.name}>
                  <TooltipTrigger asChild>
                    <a
                      className="group ring-background relative rounded-full ring-2 transition-transform hover:z-10 hover:scale-110"
                      href={s.url}
                      rel="noopener noreferrer"
                      style={{ marginLeft: i === 0 ? 0 : "-10px" }}
                      target="_blank"
                    >
                      {s.logo ? (
                        <div className="ring-border flex size-13 items-center justify-center overflow-hidden rounded-full bg-white p-3 ring-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            alt={s.name}
                            className="size-full max-h-6 max-w-6 object-contain object-center"
                            src={s.logo}
                          />
                        </div>
                      ) : (
                        <UserAvatar
                          className="rounded-full"
                          name={s.name}
                          size={52}
                          src={s.avatar}
                        />
                      )}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{s.name}</TooltipContent>
                </Tooltip>
              ))}
              {extraSponsors > 0 && (
                <span
                  aria-label={`${extraSponsors} more sponsors`}
                  className="bg-muted text-muted-foreground ring-background relative z-10 flex size-13 items-center justify-center rounded-full text-xs font-medium ring-2"
                  style={{ marginLeft: "-10px" }}
                >
                  +{extraSponsors}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      {contributors.length > 0 && (
        <section className="container-wrapper relative pt-12">
          <div className="container mx-auto flex max-w-2xl flex-col items-center gap-4">
            <p className="text-muted-foreground text-xs font-medium tracking-widest uppercase">
              Contributors
            </p>
            <div className="flex max-w-lg flex-wrap justify-center gap-y-1">
              {visibleContributors.map((c, i) => (
                <Tooltip key={c.login}>
                  <TooltipTrigger asChild>
                    <a
                      className="group ring-background relative rounded-full ring-2 transition-transform hover:z-10 hover:scale-110"
                      href={c.html_url}
                      rel="noopener noreferrer"
                      style={{ marginLeft: i === 0 ? 0 : "-8px" }}
                      target="_blank"
                    >
                      <UserAvatar
                        className="rounded-full"
                        name={c.login}
                        size={36}
                        src={c.avatar_url}
                      />
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {c.login} · {c.contributions} commits
                  </TooltipContent>
                </Tooltip>
              ))}
              {extraContributors > 0 && (
                <span
                  aria-label={`${extraContributors} more contributors`}
                  className="bg-muted text-muted-foreground ring-background relative z-10 flex size-9 items-center justify-center rounded-full text-[10px] font-medium ring-2"
                  style={{ marginLeft: "-8px" }}
                >
                  +{extraContributors}
                </span>
              )}
            </div>
          </div>
        </section>
      )}

      <div className="h-16 md:h-20 lg:h-24" />
    </PageTransition>
  );
};

export default SponsorPage;
