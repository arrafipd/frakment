export interface ComponentDefault {
  bezier?: [number, number, number, number];
  duration?: number;
  label: string;
  name: string;
  spring?: { stiffness: number; damping: number };
  type: "tween" | "spring";
}

export const COMPONENT_DEFAULTS: ComponentDefault[] = [
  {
    bezier: [0.32, 0.72, 0, 1],
    duration: 0.45,
    label: "Accordion",
    name: "accordion",
    type: "tween",
  },
  {
    bezier: [0.32, 0.72, 0, 1],
    duration: 0.45,
    label: "Collapsible",
    name: "collapsible",
    type: "tween",
  },
  {
    label: "Trace",
    name: "trace",
    spring: { damping: 30, stiffness: 200 },
    type: "spring",
  },
  {
    bezier: [0, 0, 0.58, 1],
    duration: 0.2,
    label: "Message Animated",
    name: "message-animated",
    type: "tween",
  },
  { duration: 0.3, label: "Text Morph", name: "text-morph", type: "tween" },
  {
    bezier: [0.45, 0, 0.55, 1],
    duration: 0.45,
    label: "Credit Card (Masked)",
    name: "credit-card",
    type: "tween",
  },
];

export interface CurveEntry {
  bezier: [number, number, number, number];
  name: string;
}

export const TOKENS: CurveEntry[] = [
  { bezier: [0, 0, 1, 1], name: "linear" },
  { bezier: [0.25, 0.1, 0.25, 1], name: "ease" },
  { bezier: [0.42, 0, 1, 1], name: "easeIn" },
  { bezier: [0, 0, 0.58, 1], name: "easeOut" },
  { bezier: [0.42, 0, 0.58, 1], name: "easeInOut" },
  { bezier: [0.12, 0, 0.39, 0], name: "sineIn" },
  { bezier: [0.61, 1, 0.88, 1], name: "sineOut" },
  { bezier: [0.37, 0, 0.63, 1], name: "sineInOut" },
  { bezier: [0.11, 0, 0.5, 0], name: "quadIn" },
  { bezier: [0.5, 1, 0.89, 1], name: "quadOut" },
  { bezier: [0.45, 0, 0.55, 1], name: "quadInOut" },
  { bezier: [0.32, 0, 0.67, 0], name: "cubicIn" },
  { bezier: [0.33, 1, 0.68, 1], name: "cubicOut" },
  { bezier: [0.65, 0, 0.35, 1], name: "cubicInOut" },
  { bezier: [0.5, 0, 0.75, 0], name: "quartIn" },
  { bezier: [0.25, 1, 0.5, 1], name: "quartOut" },
  { bezier: [0.76, 0, 0.24, 1], name: "quartInOut" },
  { bezier: [0.64, 0, 0.78, 0], name: "quintIn" },
  { bezier: [0.22, 1, 0.36, 1], name: "quintOut" },
  { bezier: [0.83, 0, 0.17, 1], name: "quintInOut" },
  { bezier: [0.7, 0, 0.84, 0], name: "expoIn" },
  { bezier: [0.16, 1, 0.3, 1], name: "expoOut" },
  { bezier: [0.87, 0, 0.13, 1], name: "expoInOut" },
  { bezier: [0.55, 0, 1, 0.45], name: "circIn" },
  { bezier: [0, 0.55, 0.45, 1], name: "circOut" },
  { bezier: [0.85, 0, 0.15, 1], name: "circInOut" },
  { bezier: [0.36, 0, 0.66, -0.56], name: "backIn" },
  { bezier: [0.34, 1.56, 0.64, 1], name: "backOut" },
  { bezier: [0.68, -0.6, 0.32, 1.6], name: "backInOut" },
];
