"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";

import type { HeartHandshakeIconHandle } from "@/components/animated-icons/heart-handshake";
import { HeartHandshakeIcon } from "@/components/animated-icons/heart-handshake";
import { SiteButton } from "@/components/site/button";
import { ROUTES } from "@/constants/routes";

export const SponsorLink = () => {
  const heartRef = useRef<HeartHandshakeIconHandle>(null);

  const handleMouseEnter = useCallback(() => {
    heartRef.current?.startAnimation();
  }, []);

  const handleMouseLeave = useCallback(() => {
    heartRef.current?.stopAnimation();
  }, []);

  return (
    <SiteButton
      asChild
      className="max-sm:size-8"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      size="sm"
      variant="ghost"
    >
      <Link className="inline-flex items-center gap-1.5" href={ROUTES.SPONSOR}>
        <HeartHandshakeIcon
          className="size-5 text-pink-500 sm:size-4.5"
          ref={heartRef}
        />
        <span className="max-sm:sr-only">Sponsor</span>
      </Link>
    </SiteButton>
  );
};
