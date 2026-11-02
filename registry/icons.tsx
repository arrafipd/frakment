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

  ChatCircleDots as MessageCircleDashedIcon,

  CaretUp as ChevronUpIcon,

  CaretUp as ChevronUp,

  // form/UI icons

  Cloud,

  Cloud as CloudIcon,

  Bell,

  Bell as BellIcon,

  Envelope,

  Envelope as EnvelopeIcon,

  Envelope as MailIcon,

  CreditCard,

  CreditCard as CreditCardIcon,

  EyeClosed,

  EyeClosed as EyeOffIcon,

  Star as StarIcon,

  Minus,

  Minus as MinusIcon,

  ArrowsClockwise as RefreshCcwIcon,

  // toggle

  Bookmark,

  Bookmark as BookmarkIcon,

  TextB as BoldIcon,

  TextB as Bold,

  TextItalic as ItalicIcon,

  TextItalic as Italic,

  TextUnderline as UnderlineIcon,

  TextUnderline as Underline,

  // misc icons

  Clock,

  Clock as ClockIcon,

  FileCode,

  FileCode as FileCodeIcon,

  FileCode as FileCode2Icon,

  Gauge,

  Gauge as GaugeIcon,

  GitBranch,

  GitBranch as GitBranchIcon,

  GitPullRequest,

  GitPullRequest as GitPullRequestIcon,

  Network,

  Network as NetworkIcon,

  Package,

  Package as PackageIcon,

  Rocket,

  Rocket as RocketIcon,

  Trash,

  Trash as TrashIcon,

  Paragraph,

  Paragraph as WrapTextIcon,

  // mdx docs icons
  Robot,
  Robot as BotIcon,
  Code,
  Code as CodeIcon,
  Files,
  Files as FilesIcon,
  FileText,
  FileText as FileTextIcon,
  List,
  List as ListIcon,
  TreeStructure,
  TreeStructure as ListTreeIcon,
  ChatCentered,
  ChatCentered as MessageSquareIcon,
  Sparkle,
  Sparkle as SparklesIcon,
} from "@phosphor-icons/react";


