/**

 * Phosphor icons re-exported under Icon-suffixed names.

 * the codebase already uses. Migration path: replace

 *   import { X } from the old icon library

 * with:

 *   import { X } from "@/lib/icons"

 *

 * Zero logic change. Visual may shift slightly (Phosphor stroke width

 * differs from other libraries' 2px default). All icons are registered below.

 *

 * For new code, prefer the Scalar-style adapter:

 *   <Icon src="phosphor/regular/check" size={16} /> (Scalar adapter)

 *   <Icon src="phosphor/regular/check" size={16} />

 */

"use client";

import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react";

import type { ComponentType } from "react";

/** Type alias for icon components (Phosphor props). */

export type IconComponent = ComponentType<PhosphorIconProps>;

export {
  ArrowClockwise,
  ArrowClockwise as ArrowClockwiseIcon,
  ArrowDown,
  ArrowDown as ArrowDownIcon,
  ArrowElbowDownLeft as CornerDownLeftIcon,
  ArrowElbowDownLeft as CornerDownLeft,
  ArrowLeft,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight,
  ArrowRight as ArrowRightIcon,
  ArrowSquareOut as ExternalLink,
  ArrowsClockwise as RefreshCcwIcon,
  // Chat demo

  ArrowUp,
  ArrowUp as ArrowUpIcon,
  ArrowUpRight,
  ArrowUpRight as ArrowUpRightIcon,
  Bell,
  Bell as BellIcon,
  Binoculars,
  Binoculars as TelescopeIcon,
  // toggle

  Bookmark,
  Bookmark as BookmarkIcon,
  BookOpen as BookOpenTextIcon,
  BookOpen as BookOpenText,
  CaretDown as ChevronDownIcon,
  CaretDown as ChevronDown,
  CaretRight as ChevronRightIcon,
  CaretRight as ChevronRight,
  CaretUp as ChevronUpIcon,
  CaretUp as ChevronUp,
  ChatCentered,
  ChatCentered as MessageSquareIcon,
  ChatCircleDots as MessageCircleDashedIcon,
  ChatTeardropDots,
  // direct matches

  Check,
  Check as CheckIcon,
  CheckCircle as CircleCheckIcon,
  CheckCircle as CircleCheck,
  Circle,
  Circle as CircleIcon,
  CircleDashed,
  CircleDashed as CircleDashedIcon,
  CircleNotch as LoaderCircleIcon,
  CircleNotch as LoaderCircle,
  CircleNotch as LoaderIcon,
  CircleNotch as Loader,
  // misc icons

  Clock,
  Clock as ClockIcon,
  // form/UI icons

  Cloud,
  Cloud as CloudIcon,
  Code,
  Code as CodeIcon,
  Copy,
  Copy as CopyIcon,
  CreditCard,
  CreditCard as CreditCardIcon,
  DotsThree as EllipsisIcon,
  DotsThree as Ellipsis,
  Download,
  Download as DownloadIcon,
  Envelope,
  Envelope as EnvelopeIcon,
  Envelope as MailIcon,
  EyeClosed,
  EyeClosed as EyeOffIcon,
  File,
  File as FileIcon,
  FileCode,
  FileCode as FileCodeIcon,
  FileCode as FileCode2Icon,
  Files,
  Files as FilesIcon,
  FileText,
  FileText as FileTextIcon,
  Folder,
  Folder as FolderIcon,
  Gauge,
  Gauge as GaugeIcon,
  GitBranch,
  GitBranch as GitBranchIcon,
  GitPullRequest,
  GitPullRequest as GitPullRequestIcon,
  Globe,
  Heart,
  Image,
  Info,
  Info as InfoIcon,
  Link,
  Link as LinkIcon,
  List as MenuIcon,
  List as Menu,
  List,
  List as ListIcon,
  MagnifyingGlass as SearchIcon,
  MagnifyingGlass as Search,
  Minus,
  Minus as MinusIcon,
  Network,
  Network as NetworkIcon,
  Package,
  Package as PackageIcon,
  Paperclip,
  Paragraph,
  Paragraph as WrapTextIcon,
  Plus,
  Plus as PlusIcon,
  // mdx docs icons
  Robot,
  Robot as BotIcon,
  Rocket,
  Rocket as RocketIcon,
  Selection as SquareDashedIcon,
  Selection as SquareDashed,
  Sidebar as PanelLeftIcon,
  Sidebar as PanelLeft,
  Sparkle,
  Sparkle as SparklesIcon,
  Star,
  Star as StarIcon,
  Terminal,
  Terminal as TerminalIcon,
  TerminalWindow as TerminalSquareIcon,
  TerminalWindow as TerminalSquare,
  TextB as BoldIcon,
  TextB as Bold,
  TextItalic as ItalicIcon,
  TextItalic as Italic,
  TextUnderline as UnderlineIcon,
  TextUnderline as Underline,
  Trash,
  Trash as TrashIcon,
  TreeStructure,
  TreeStructure as ListTreeIcon,
  Warning as TriangleAlertIcon,
  Warning as TriangleAlert,
  WarningCircle as CircleAlertIcon,
  WarningCircle as CircleAlert,
  X,
  X as XIcon,
} from "@phosphor-icons/react";
