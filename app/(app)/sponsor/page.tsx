import type { Metadata } from "next";

import { ExternalLinkButton } from "@/components/external-link-button";
import { PageTransition } from "@/components/page-transition";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/user-avatar";
import { LINK } from "@/constants/links";
import { ROUTES } from "@/constants/routes";
import { getContributors, getSponsors } from "@/lib/github";
import { ExternalLink, Heart, Star } from "@/lib/icons";
import { createPageMetadata } from "@/seo/metadata";

export const metadata: Metadata = createPageMetadata({
  description:
    "Support Frakment, an open-source monochrome component registry for AI interfaces.",
  path: ROUTES.SPONSOR,
  title: "Sponsor",
});

const MAX_SPONSORS = 12;
const MAX_CONTRIBUTORS = 30;

const SponsorPage = async () => {
  const [sponsors, contributors] = await Promise.all([
    getSponsors(),
    getContributors(),
  ]);

  const visibleSponsors = sponsors.slice(0, MAX_SPONSORS);
  const extraSponsors = sponsors.length - visibleSponsors.length;
  const visibleContributors = contributors.slice(0, MAX_CONTRIBUTORS);
  const extraContributors = contributors.length - visibleContributors.length;

  return (
    <PageTransition>
      <section className="container-wrapper relative">
        <div className="container flex max-w-2xl flex-col items-center gap-4 py-16 text-center md:py-20 lg:py-24">
          <h1 className="from-foreground via-foreground to-foreground/65 bg-linear-to-b bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Support Frakment
          </h1>
          <p className="text-muted-foreground max-w-xl text-base text-balance">
            Frakment is a monochrome component registry for AI interfaces. Every
            component is free, open source, and that is not changing.
          </p>
          <p className="text-muted-foreground max-w-xl text-sm text-balance">
            No paywalled features, no gated components. If Frakment made your
            project better, sponsoring is a nice way to say so.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <ExternalLinkButton href={LINK.SPONSOR} size="lg">
              <Heart />
              Sponsor on GitHub
              <ExternalLink className="size-3.5 opacity-60" />
            </ExternalLinkButton>
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
                <Tooltip key={s.login}>
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
                          name={s.name || s.login}
                          size={52}
                          src={s.avatar_url}
                        />
                      )}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{s.name}</TooltipContent>
                </Tooltip>
              ))}
              {extraSponsors > 0 && (
                <a
                  className="bg-muted text-muted-foreground ring-background hover:bg-accent hover:text-foreground relative z-10 flex size-13 items-center justify-center rounded-full text-xs font-medium ring-2 transition-colors hover:z-20"
                  href={LINK.SPONSOR}
                  rel="noopener noreferrer"
                  style={{ marginLeft: "-10px" }}
                  target="_blank"
                >
                  +{extraSponsors}
                </a>
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
                <a
                  className="bg-muted text-muted-foreground ring-background hover:bg-accent hover:text-foreground relative z-10 flex size-9 items-center justify-center rounded-full text-[10px] font-medium ring-2 transition-colors hover:z-20"
                  href={`${LINK.GITHUB}/graphs/contributors`}
                  rel="noopener noreferrer"
                  style={{ marginLeft: "-8px" }}
                  target="_blank"
                >
                  +{extraContributors}
                </a>
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
