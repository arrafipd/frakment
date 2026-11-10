export const springSoft = {
  damping: 30,
  stiffness: 200,
  type: "spring",
} as const;

export const easeInOut = [0.4, 0, 0.2, 1] as const;
export const easeInOutQuad = [0.45, 0, 0.55, 1] as const;
export const easeOutExpo = [0.16, 1, 0.3, 1] as const;
export const easeSmoothOut = [0.32, 0.72, 0, 1] as const;

export const durationFast = 0.2;
export const durationNormal = 0.3;
export const durationSlow = 0.45;

export const delayTight = 0.02;
