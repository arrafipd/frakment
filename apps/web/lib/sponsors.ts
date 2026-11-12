/**
 * Sponsors - maintained MANUALLY by the maintainer.
 *
 * To add a sponsor:
 *   1. (Optional) Drop a logo at `public/sponsors/<name>.svg` (transparent bg).
 *   2. Add an entry to the SPONSORS array below.
 *   3. Commit & deploy.
 */

export interface Sponsor {
  /** External avatar URL (e.g. GitHub avatar). Optional. */
  avatar?: string;
  /** Path under /public/sponsors/, e.g. "/sponsors/acme.svg". Optional. */
  logo?: string;
  name: string;
  url: string;
}

export const SPONSORS: Sponsor[] = [
  // Add sponsors here. Example:
  // { name: "Acme Corp", url: "https://acme.com", logo: "/sponsors/acme.svg" },
];
