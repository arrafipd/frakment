import { clamp, RAD } from "./math";

export interface SpherePoint {
  lat: number;
  lon: number;
}

export const onSphere = (x: number, y: number): SpherePoint => {
  const lat = Math.asin(clamp(y, -0.96, 0.96));
  const lon = Math.asin(clamp(x / Math.cos(lat), -0.96, 0.96));
  return { lat, lon };
};

export const place = (lon: number, lat: number, roll = 0): string =>
  `rotateY(${(lon * RAD).toFixed(3)}deg) rotateX(${(-lat * RAD).toFixed(3)}deg) translateZ(calc(var(--s) / 2))${roll ? ` rotateZ(${(roll * RAD).toFixed(3)}deg)` : ""}`;
