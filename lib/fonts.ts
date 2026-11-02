import {
  Inter_Tight as FontSans,
  JetBrains_Mono as FontMono,
} from "next/font/google";

import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400"],
});

export const fontVariables = cn(fontSans.variable, fontMono.variable);
