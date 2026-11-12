"use client";

import Image from "next/image";
import { useState } from "react";

import { getFallbackAvatar } from "@/lib/avatar-fallback";

export const UserAvatar = ({
  src,
  name,
  size = 36,
  className = "",
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) => {
  const [errored, setErrored] = useState(false);
  const finalSrc = !src || errored ? getFallbackAvatar(name) : src;

  return (
    <Image
      alt={name}
      className={className}
      height={size}
      onError={() => setErrored(true)}
      src={finalSrc}
      unoptimized
      width={size}
    />
  );
};
