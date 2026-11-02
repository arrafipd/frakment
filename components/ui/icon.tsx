"use client";

import {
  ArrowLeft,
  ArrowRight,
  ArrowSquareOut,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Check,
  CircleNotch,
  Copy,
  Info,
  List,
  MagnifyingGlass,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import {
  SiGithub,
  SiNextdotjs,
  SiReact,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
} from "@icons-pack/react-simple-icons";
import type { CSSProperties } from "react";

/**
 * Universal icon renderer — Scalar-style API.
 *
 *   <Icon src="phosphor/regular/check" />
 *   <Icon src="simple/github" size={24} />
 *   <Icon src="/custom/path.svg" />
 *
 * Only names registered in the maps below are bundled, so adding an
 * icon is a one-line registry change and tree-shaking keeps the
 * bundle at just the used icons.
 */

export type IconWeight =
  | "thin"
  | "light"
  | "regular"
  | "bold"
  | "fill"
  | "duotone";

export const phosphorIcons = {
  "arrow-left": ArrowLeft,
  "arrow-right": ArrowRight,
  "arrow-square-out": ArrowSquareOut,
  "caret-down": CaretDown,
  "caret-left": CaretLeft,
  "caret-right": CaretRight,
  "caret-up": CaretUp,
  check: Check,
  "circle-notch": CircleNotch,
  copy: Copy,
  info: Info,
  list: List,
  "magnifying-glass": MagnifyingGlass,
  "warning-circle": WarningCircle,
  x: X,
} as const;

export const simpleIcons = {
  github: SiGithub,
  nextdotjs: SiNextdotjs,
  react: SiReact,
  tailwindcss: SiTailwindcss,
  typescript: SiTypescript,
  vercel: SiVercel,
} as const;

export type PhosphorIconName = keyof typeof phosphorIcons;
export type SimpleIconName = keyof typeof simpleIcons;

export interface IconProps {
  src: string;
  size?: number;
  color?: string;
  title?: string;
  className?: string;
  style?: CSSProperties;
}

export function Icon({
  src,
  size = 24,
  color,
  title,
  className,
  style,
}: IconProps) {
  if (src.startsWith("phosphor/")) {
    const parts = src.split("/");
    const weight = parts[1] as IconWeight;
    const name = parts.slice(2).join("/") as PhosphorIconName;
    const Component = phosphorIcons[name];

    if (!Component) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Icon] Unknown Phosphor icon: "${name}" (src="${src}")`);
      }
      return null;
    }

    return (
      <Component
        weight={weight}
        size={size}
        color={color}
        className={className}
        style={style}
        aria-label={title}
        role={title ? "img" : undefined}
      />
    );
  }

  if (src.startsWith("simple/")) {
    const name = src.slice("simple/".length) as SimpleIconName;
    const Component = simpleIcons[name];

    if (!Component) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[Icon] Unknown Simple icon: "${name}" (src="${src}")`);
      }
      return null;
    }

    return (
      <Component
        size={size}
        color={color}
        title={title}
        className={className}
        style={style}
      />
    );
  }

  return (
    <img
      src={src}
      alt={title ?? ""}
      width={size}
      height={size}
      className={className}
      style={style}
    />
  );
}