/**
 * Sphere projection helpers extracted from components/orbs.tsx.
 *
 * `onSphere` maps a face position (x to the right, y down, both as
 * shares of the radius) to a longitude/latitude pair in radians.
 * `place` turns that pair into a CSS transform that positions an
 * element on the sphere at radius var(--s) / 2.
 *
 * Identical to the original closure functions — visual parity is
 * guaranteed because no arithmetic has changed.
 */

import { RAD, clamp } from "./math";

export interface SpherePoint {
  lon: number;
  lat: number;
}

export const onSphere = (x: number, y: number): SpherePoint => {
  const lat = Math.asin(clamp(y, -0.96, 0.96));
  const lon = Math.asin(clamp(x / Math.cos(lat), -0.96, 0.96));
  return { lon, lat };
};

export const place = (lon: number, lat: number, roll = 0): string =>
  `rotateY(${(lon * RAD).toFixed(3)}deg) rotateX(${(-lat * RAD).toFixed(3)}deg) translateZ(calc(var(--s) / 2))${roll ? ` rotateZ(${(roll * RAD).toFixed(3)}deg)` : ""}`;
