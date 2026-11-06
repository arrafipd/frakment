export const SPRING_SMOOTH = {
  damping: 30,
  stiffness: 200,
  type: "spring",
} as const;

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_SMOOTH = [0.32, 0.72, 0, 1] as const;
export const EASE_IN_OUT = [0.4, 0, 0.2, 1] as const;

export const DURATION_FAST = 0.2;
export const DURATION_SMOOTH = 0.45;
