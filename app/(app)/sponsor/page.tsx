import { ExternalLink, Heart, Star } from "@/lib/icons";
import type { Metadata } from "next";
import Image from "next/image";

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
          <h1 className="bg-linear-to-b from-foreground via-foreground to-foreground/65 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl md:text-6xl">
            Support Frakment
          </h1>
          <p className="max-w-xl text-base text-balance text-muted-foreground">
            Frakment is a monochrome component registry for AI interfaces. Every
            component is free, open source, and that is not changing.
          </p>
          <p className="max-w-xl text-sm text-balance text-muted-foreground">
            No paywalled features, no gated components. If Frakment made your
            project better, sponsoring is a nice way to say so.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <ExternalLinkButton size="lg" href={LINK.SPONSOR}>
              <Heart />
              Sponsor on GitHub
              <ExternalLink className="size-3.5 opacity-60" />
            </ExternalLinkButton>
            <ExternalLinkButton size="lg" variant="outline" href={LINK.GITHUB}>
              <Star />
              Star on GitHub
            </ExternalLinkButton>
          </div>
        </div>
      </section>

      {sponsors.length > 0 && (
        <section className="container-wrapper relative">
          <div className="container mx-auto flex max-w-2xl flex-col items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Sponsors
            </p>
            <div className="flex max-w-lg flex-wrap justify-center gap-y-1">
              {visibleSponsors.map((s, i) => (
                <Tooltip key={s.login}>
                  <TooltipTrigger asChild>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-full ring-2 ring-background transition-transform hover:z-10 hover:scale-110"
                      style={{ marginLeft: i === 0 ? 0 : "-10px" }}
                    >
                      {s.logo ? (
                        <div className="flex size-13 items-center justify-center overflow-hidden rounded-full bg-white p-3 ring-1 ring-border">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={s.logo}
                            alt={s.name}
                            className="size-full max-h-6 max-w-6 object-contain object-center"
                          />
                        </div>
                      ) : (
                        <UserAvatar
                          src={s.avatar_url}
                          name={s.name || s.login}
                          size={52}
                          className="rounded-full"
                        />
                      )}
                    </a>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">{s.name}</TooltipContent>
                </Tooltip>
              ))}
              {extraSponsors > 0 && (
                <a
                  href={LINK.SPONSOR}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 flex size-13 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground ring-2 ring-background transition-colors hover:z-20 hover:bg-accent hover:text-foreground"
                  style={{ marginLeft: "-10px" }}
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
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Contributors
            </p>
            <div className="flex max-w-lg flex-wrap justify-center gap-y-1">
              {visibleContributors.map((c, i) => (
                <Tooltip key={c.login}>
                  <TooltipTrigger asChild>
                    <a
                      href={c.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-full ring-2 ring-background transition-transform hover:z-10 hover:scale-110"
                      style={{ marginLeft: i === 0 ? 0 : "-8px" }}
                    >
                      <UserAvatar
                        src={c.avatar_url}
                        name={c.login}
                        size={36}
                        className="rounded-full"
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
                  href={`${LINK.GITHUB}/graphs/contributors`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative z-10 flex size-9 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background transition-colors hover:z-20 hover:bg-accent hover:text-foreground"
                  style={{ marginLeft: "-8px" }}
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
