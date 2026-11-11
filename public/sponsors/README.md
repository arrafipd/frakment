# Sponsor Logos

Custom brand logos for GitHub Sponsors supporting Frakment.

By default, sponsors render as their GitHub avatar. Drop a logo file here and register it to replace the avatar with a brand mark inside a white circle.

## Quick Start

### 1. Get the SVG logo

Pick one of these sources:

- **Simple Icons**: https://simpleicons.org — search the brand, click it, download SVG
- **Brand assets page**: visit `brand.com/brand`, `brand.com/press`, or `brand.com/press-kit`
- **SVGL**: https://svgl.app — curated SVG logo collection
- **Brand website footer**: look for "Brand", "Press", or "Media kit" links

If none of these exist, **skip the logo** — the sponsor avatar will still render automatically.

### 2. Save the file

File name must match the sponsor GitHub username (lowercase).

```
public/sponsors/{github-login}.svg
```

Examples:

| GitHub login | File to save                     |
| ------------ | -------------------------------- |
| `vercel`     | `public/sponsors/vercel.svg`     |
| `acme-corp`  | `public/sponsors/acme-corp.svg`  |
| `sarah-chen` | `public/sponsors/sarah-chen.svg` |

### 3. Register in the mapping

Open `lib/sponsor-logos.ts` and add one line per sponsor:

```ts
export const SPONSOR_LOGOS: Record<string, string> = {
  vercel: "/sponsors/vercel.svg",
  "acme-corp": "/sponsors/acme-corp.svg",
  "sarah-chen": "/sponsors/sarah-chen.svg",
};
```

The key must be **lowercase**. The value must start with `/sponsors/` (leading slash, no `public`).

### 4. Restart

```bash
npm run dev
```

Open `/sponsor`. The new logo appears in a white circle. Sponsors without a registered logo keep using their GitHub avatar.

## File Rules

| Rule                              | Required                                |
| --------------------------------- | --------------------------------------- |
| Format: `.svg`                    | Preferred                               |
| Format: `.png`                    | Works, but less sharp on retina         |
| Background: transparent           | Strongly recommended                    |
| File name: lowercase GitHub login | Yes                                     |
| File size: under 20 KB            | Recommended                             |
| Aspect ratio: any                 | Works, `object-contain` handles scaling |

Why transparent background matters: logos render inside a white circle on light mode and stay readable on dark mode. A logo with its own white box will show as a **box inside a circle**.

## How Rendering Works

```
GitHub Sponsors API
        |
        v
getSponsors()  ->  { login, avatar_url, name, url }
        |
        v
getSponsorLogo(login)
        |
        +-- found in SPONSOR_LOGOS  ->  render brand SVG inside white circle
        |
        +-- not found               ->  render GitHub avatar (rounded)
```

No logo file is required. Every sponsor already renders. This folder only exists to **upgrade** the avatar to a proper brand mark.

## Example

Say a new sponsor **Acme Corp** (GitHub login `acme-corp`) joined GitHub Sponsors.

1. Download `acme-logo.svg` from `acme.com/brand`
2. Save it as `public/sponsors/acme-corp.svg`
3. Open `lib/sponsor-logos.ts` and add:
   ```ts
   "acme-corp": "/sponsors/acme-corp.svg",
   ```
4. Run `npm run dev` and open `/sponsor`

The sponsor now renders with the Acme logo in a white circle. If you later remove the file or the mapping entry, it falls back to the GitHub avatar automatically.

## Common Issues

**Logo not showing after adding the file**

- Check file name matches the GitHub login exactly (case-insensitive but keep lowercase)
- Check `lib/sponsor-logos.ts` mapping key matches too
- Check the path starts with `/sponsors/` not `public/sponsors/`
- Hard refresh the browser (Ctrl+Shift+R)

**Logo shows as a box inside a circle**

- The SVG has a white or dark background baked in. Re-export with transparent background.

**Logo looks blurry**

- You are using PNG. Switch to SVG if the brand offers one.

**Avatar fallback appears instead of the logo**

- Mapping key does not match sponsor GitHub login. Open the sponsor profile on GitHub and check the username in the URL.
