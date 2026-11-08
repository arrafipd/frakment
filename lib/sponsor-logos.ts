// Map GitHub login -> logo file in /public/sponsors/
// Drop your SVG in public/sponsors/{login}.svg and add it here.
// If not listed, falls back to the sponsor GitHub avatar.

export const SPONSOR_LOGOS: Record<string, string> = {
  // "vercel": "/sponsors/vercel.svg",
};

export const getSponsorLogo = (login: string): string | undefined =>
  SPONSOR_LOGOS[login.toLowerCase()];
