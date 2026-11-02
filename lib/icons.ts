/**
 * Lucide-compatible shim — re-exports Phosphor icons under the names
 * the codebase already uses. Migration path: replace
 *   import { X } from "old-library"
 * with:
 *   import { X } from "@/lib/icons"
 *
 * Zero logic change. Visual may shift slightly (Phosphor stroke width
 * differs from Lucide's 2px default). All icons are registered below.
 *
 * For new code, prefer the Scalar-style adapter:
 *   import { Icon } from "@/components/ui/icon";
 *   <Icon src="phosphor/regular/check" size={16} />
 */

"use client";

import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";
import type { ComponentType } from "react";

/** Type alias replacing Lucide's LucideIcon type. */
export type LucideIcon = ComponentType<PhosphorIconProps>;

export {
  // direct matches
  Check,
  Check as CheckIcon,
  Copy,
  Copy as CopyIcon,
  File,
  File as FileIcon,
  X,
  X as XIcon,
  ArrowLeft,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight,
  ArrowRight as ArrowRightIcon,
  ArrowUpRight,
  ArrowUpRight as ArrowUpRightIcon,
  ArrowDown,
  ArrowDown as ArrowDownIcon,
  Circle,
  Circle as CircleIcon,
  CircleDashed,
  CircleDashed as CircleDashedIcon,
  Download,
  Download as DownloadIcon,
  Heart,
  Info,
  Info as InfoIcon,
  Folder,
  Folder as FolderIcon,
  Link,
  Link as LinkIcon,
  Terminal,
  Terminal as TerminalIcon,
  Plus,
  Plus as PlusIcon,
  Star,
  CaretRight as ChevronRightIcon,
  CaretRight as ChevronRight,
  CaretDown as ChevronDownIcon,
  CaretDown as ChevronDown,
  CircleNotch as LoaderCircleIcon,
  CircleNotch as LoaderCircle,
  CircleNotch as LoaderIcon,
  CircleNotch as Loader,
  CheckCircle as CircleCheckIcon,
  CheckCircle as CircleCheck,
  MagnifyingGlass as SearchIcon,
  MagnifyingGlass as Search,
  Sidebar as PanelLeftIcon,
  Sidebar as PanelLeft,
  ArrowSquareOut as ExternalLink,
  Warning as TriangleAlertIcon,
  Warning as TriangleAlert,
  List as MenuIcon,
  List as Menu,
  Selection as SquareDashedIcon,
  Selection as SquareDashed,
  ArrowElbowDownLeft as CornerDownLeftIcon,
  ArrowElbowDownLeft as CornerDownLeft,
  DotsThree as EllipsisIcon,
  DotsThree as Ellipsis,
  TerminalWindow as TerminalSquareIcon,
  TerminalWindow as TerminalSquare,
  BookOpen as BookOpenTextIcon,
  BookOpen as BookOpenText,
  WarningCircle as CircleAlertIcon,
  WarningCircle as CircleAlert,
  // Chat demo
  ArrowUp,
  ArrowUp as ArrowUpIcon,
  ArrowClockwise,
  ArrowClockwise as ArrowClockwiseIcon,
  Paperclip,
  Image,
  Binoculars,
  Binoculars as TelescopeIcon,
  Globe,
  ChatTeardropDots,
  ChatTeardropDots as MessageCircleDashedIcon,
} from "@phosphor-icons/react";
