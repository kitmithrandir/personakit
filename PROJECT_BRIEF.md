# PersonaKit — Complete Project Brief

**Last Updated:** February 16, 2026
**Creator:** Kit Mithrandir
**Domain:** personakit.dev
**Email:** mithrandir@personakit.dev

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Identity & Branding](#identity--branding)
3. [Technical Architecture](#technical-architecture)
4. [File Structure](#file-structure)
5. [Persona File Schema](#persona-file-schema)
6. [Submission Flow](#submission-flow)
7. [Validation Logic](#validation-logic)
8. [Frontend Components](#frontend-components)
9. [GitHub Actions](#github-actions)
10. [Deployment](#deployment)
11. [Monetization Strategy](#monetization-strategy)
12. [Development Roadmap](#development-roadmap)
13. [Future Feature Ideas](#future-feature-ideas)

---

## Project Overview

### What is PersonaKit?

PersonaKit is a community-driven marketplace where users discover, share, and export AI persona configurations. Each persona is defined by two markdown files — IDENTITY.md and SOUL.md — that follow the OpenClaw spec and can be exported for any major AI platform.

**Primary Use Case:**
Users browse a curated library of persona files, preview them, and export with one click for:
- OpenClaw (native format)
- Claude Code (CLAUDE.md)
- Codex (AGENTS.md)
- Cursor (.cursorrules)
- ChatGPT (paste as first message)

**Key Differentiator:**
OpenClaw-native personas with instant one-click exports for every major AI platform, plus a community contribution pipeline that requires zero GitHub knowledge from submitters.

### Vision

Build a low-maintenance, highly monetizable platform that:
- Serves the AI-tooling community (technical audience, but accessible to all)
- Scales without constant oversight
- Generates passive income through ads, sponsorships, premium content
- Remains open source and community-driven

### Success Metrics

**Phase 1 (Months 1-3):** 0-1K visitors/mo, $0-250/mo revenue
**Phase 2 (Months 4-8):** 5-10K visitors/mo, $700-1,900/mo revenue
**Phase 3 (Months 9-18):** 25-50K visitors/mo, $2,500-5,000/mo revenue

---

## Identity & Branding

### Founder Persona

**Name:** Kit Mithrandir
**Email:** mithrandir@personakit.dev
**Privacy:** Real identity protected via WHOIS privacy, alias used for all public communications

### Brand Voice

**Tone:** Professional but playful, wise mentor (Gandalf energy without the cringe)

**Style Guidelines:**
- Helpful and approachable
- Occasional LOTR Easter eggs (subtle)
- Technical but not intimidating
- No wizard roleplay
- No corporate jargon

**Example Copy:**
```
"Find the right specialist for any task.
Browse community-built AI personas — ready to use
with OpenClaw, Claude, ChatGPT, Cursor, or any AI platform."
```

### Visual Identity — "The Forge"

**Color Palette:**

| Token   | Light Mode                       | Dark Mode                        |
|---------|----------------------------------|----------------------------------|
| Primary | `#4F46E5` indigo-600             | `#818CF8` indigo-400             |
| Accent  | `#F59E0B` amber-500              | `#FBBF24` amber-400              |
| Background | `#FAFAF9` stone-50            | `#1C1917` stone-900              |
| Surface | `#FFFFFF` white, warm gray borders | `#292524` stone-800, subtle borders |
| Text    | `#1C1917` stone-900              | `#FAFAF9` stone-50               |
| Muted   | `#78716C` stone-500              | `#A8A29E` stone-400              |

**Tailwind mapping:** `stone` for neutrals (warm grays), `indigo` for primary, `amber` for accent.

**Dark mode:** Supported from MVP. System preference detection + manual toggle in header. Uses Tailwind `dark:` variants throughout.

**Typography:** Clean, modern, developer-friendly. System font stack.

**Logo:** Text-based "PersonaKit" wordmark in the header.

---

## Technical Architecture

### Tech Stack

**Frontend:**
- **Framework:** Astro 5.17.1 (static site generator)
- **Styling:** Tailwind CSS 4.1.18 (config in CSS, no JS config file)
- **Search:** Fuse.js 7.1.0 (client-side fuzzy search)
- **Markdown:** unified 11.0.5 + remark-parse + remark-gfm + remark-rehype + rehype-sanitize + rehype-stringify
- **Frontmatter:** gray-matter 4.0.3

**Backend/Infrastructure:**
- **Hosting:** Cloudflare Pages (free tier)
- **Database:** GitHub repository (personas stored as markdown files in `configs/`)
- **Submission API:** Cloudflare Workers (serverless) — not yet implemented
- **CI/CD:** GitHub Actions — not yet implemented

**Dependencies (from package.json):**
```json
{
  "dependencies": {
    "@tailwindcss/typography": "0.5.19",
    "@tailwindcss/vite": "4.1.18",
    "astro": "5.17.1",
    "fuse.js": "7.1.0",
    "gray-matter": "4.0.3",
    "rehype-sanitize": "6.0.0",
    "rehype-stringify": "10.0.1",
    "remark-gfm": "4.0.1",
    "remark-parse": "11.0.0",
    "remark-rehype": "11.1.2",
    "tailwindcss": "4.1.18",
    "unified": "11.0.5"
  }
}
```

### Why Astro?

- Perfect for content-heavy sites (markdown-first)
- Fast builds (static output)
- Island architecture (only interactive components load JS)
- No server needed (deploy anywhere)
- SEO-friendly (pre-rendered HTML)
- Simple to understand and modify

### Architecture Diagram

```
┌──────────────────────────────────────────────────┐
│                     User                          │
└────────────────────┬─────────────────────────────┘
                     │
           ┌─────────┴─────────┐
           │                   │
      ┌────▼─────┐      ┌─────▼──────────┐
      │  Browse  │      │  /contribute   │
      │   Site   │      │  (paste files) │
      └────┬─────┘      └─────┬──────────┘
           │                  │
           │            ┌─────▼──────────────────┐
           │            │  Client-side preview   │
           │            │  + platform exports    │
           │            └─────┬──────────────────┘
           │                  │
           │            ┌─────▼──────────────────┐
           │            │  Fill metadata form    │
           │            │  (name, tags, author)  │
           │            └─────┬──────────────────┘
           │                  │
           │            ┌─────▼──────────────────┐
           │            │  Cloudflare Worker     │
           │            │  (validates + creates  │
           │            │   GitHub PR)           │
           │            └─────┬──────────────────┘
           │                  │
           │            ┌─────▼──────────────────┐
           │            │  Kit reviews + merges  │
           │            │  GitHub PR             │
           │            └─────┬──────────────────┘
           │                  │
           │            ┌─────▼──────────────────┐
           │            │  GitHub Action         │
           │            │  - Validate config     │
           │            │  - Build configs.json  │
           │            └─────┬──────────────────┘
           │                  │
      ┌────▼──────────────────▼──────────────┐
      │      Cloudflare Pages                │
      │      (Astro static site)             │
      │      - Homepage (search/filter grid) │
      │      - Persona detail pages          │
      │      - /contribute (paste + export)  │
      │      - /about                        │
      └──────────────────────────────────────┘
```

---

## File Structure

```
personakit/
├── PROJECT_BRIEF.md                    # This file — product vision & specs
├── CLAUDE.md                           # AI assistant instructions (implementation source of truth)
├── package.json
├── package-lock.json
├── astro.config.mjs
├── tsconfig.json
│
├── src/
│   ├── layouts/
│   │   └── Layout.astro                # Base page template (head, header, footer, dark mode)
│   │
│   ├── components/
│   │   ├── Header.astro                # Site header with nav + dark mode toggle
│   │   ├── Footer.astro                # Site footer with GitHub link
│   │   ├── PersonaCard.astro           # Persona card for homepage grid
│   │   ├── SearchBar.astro             # Search input with clear button + keyboard shortcuts
│   │   ├── TagFilter.astro             # Tag filter pills (OR logic, derived from data)
│   │   ├── CopyButton.astro            # Copy-to-clipboard + optional download button
│   │   └── ExportButton.astro          # Platform export card (copy, download, "How to use")
│   │
│   ├── pages/
│   │   ├── index.astro                 # Homepage (hero, search, tag filter, persona grid)
│   │   ├── contribute.astro            # Paste → validate → preview/export → submit
│   │   ├── about.astro                 # About PersonaKit & Kit Mithrandir
│   │   └── persona/
│   │       └── [...slug].astro         # Dynamic persona detail pages
│   │
│   ├── styles/
│   │   └── global.css                  # Tailwind v4 imports + global styles
│   │
│   ├── security-template.md            # Anti-prompt-injection rules (injected into all exports)
│   │
│   └── utils/
│       ├── exports.ts                  # Platform export generators + withSecurity()
│       ├── markdown.ts                 # Unified remark → rehype → sanitize pipeline
│       ├── search.ts                   # Fuse.js search configuration
│       └── types.ts                    # TypeScript types for persona configs
│
├── public/
│   ├── configs.json                    # Auto-generated persona index (never edit manually)
│   ├── favicon.svg
│   ├── robots.txt
│   └── _headers                        # Cloudflare security headers
│
├── configs/                            # Persona source files (3 authors, 12 personas)
│   ├── kitmithrandir/                  # 10 personas
│   │   ├── the-architect/
│   │   │   ├── IDENTITY.md
│   │   │   └── SOUL.md
│   │   ├── coach/
│   │   ├── code-medic/
│   │   ├── deep-diver/
│   │   ├── ghostwriter/
│   │   ├── professor/
│   │   ├── research-librarian/
│   │   ├── strategist/
│   │   ├── the-jester/
│   │   └── wordsmith/
│   ├── devandra/
│   │   └── game-master/
│   └── sparks/
│       └── (1 persona)
│
├── scripts/
│   ├── build-index.js                  # Scans configs/, generates public/configs.json
│   └── validate-config.js              # Validates all personas (syntax, size, fields)
│
├── functions/                          # Cloudflare Workers (not yet implemented)
│   └── api/
│       └── (submit.js — planned)
│
└── .github/
    └── workflows/                      # GitHub Actions (not yet implemented)
        └── (build-index.yml, validate-pr.yml — planned)
```

---

## Persona File Schema

Each persona consists of exactly **two required files** stored in `configs/{author}/{persona-name}/`:

### IDENTITY.md

Purpose: Public-facing metadata and persona role description.

**Frontmatter Fields:**
- `name` (required): Display name, 1-50 characters
- `emoji` (required): Single emoji for visual identification
- `description` (required): One-line summary, 1-200 characters
- `tags` (required): Array of 1-3 tags from the whitelist
- `author` (required): Author handle, `[a-z0-9-]` format

**Body:** Role description, expertise, what the persona does.

**Example:**
```markdown
---
name: The Architect
emoji: 🏗️
description: Systems designer who thinks in diagrams and tradeoffs
tags: [coding, technical, professional]
author: kitmithrandir
---

# Identity

You are The Architect — a systems designer who thinks in components, interfaces, and tradeoffs...
```

### SOUL.md

Purpose: Personality, tone, communication style, values, and boundaries.

**No frontmatter required.** Pure markdown body.

**Example:**
```markdown
# Soul

## Core Traits
- **Tone:** Thoughtful and precise
- **Approach:** Always considers tradeoffs
- **Style:** Uses analogies and diagrams

## Boundaries
- Never dismisses simple solutions
- Always explains the "why" behind recommendations
```

### Tag Whitelist

Allowed tags for personas (1-3 per persona):
`coding`, `creative`, `support`, `humor`, `productivity`, `research`, `writing`, `analysis`, `teaching`, `gaming`, `technical`, `professional`, `casual`, `friendly`, `direct`

### Platform Export Formats

All exports include an anti-prompt-injection security template from `src/security-template.md`.

| Platform    | Format                | Filename         | Notes                                |
|-------------|----------------------|------------------|--------------------------------------|
| OpenClaw    | Native .md per-file   | IDENTITY.md, SOUL.md | Per-file copy/download buttons   |
| Claude Code | Single merged file    | CLAUDE.md        | `# Section` headings + `---` separators |
| Codex       | Agent preamble + merged | AGENTS.md      | `## Section` headings                |
| Cursor      | Rules preamble + merged | .cursorrules   | `## Section` headings                |
| ChatGPT     | Condensed plain text  | (paste as first message) | Compact security template    |

---

## Submission Flow

There is a single submission path: the `/contribute` page. It serves two tiers of usage:

### Tier 1: Export Tool (no account, no submission)

1. User visits `/contribute`
2. Pastes IDENTITY.md and SOUL.md content into text areas
3. Client-side validation: non-empty content, 50KB size limit
4. Instant preview of rendered markdown + platform export cards
5. User copies/downloads exports for any platform
6. No submission, no form, no backend needed

**Frontmatter is not required** for export-only usage. This makes `/contribute` a universal persona-to-platform converter.

### Tier 2: Community Submission (share with the library)

After previewing, users can optionally submit to the PersonaKit library:

1. Fill in metadata form: name, emoji, description, tags, author handle, email
2. If IDENTITY.md contains frontmatter, form fields are auto-populated
3. Anti-spam: Cloudflare Turnstile + honeypot field + rate limiting (3/hr per IP) + server-side validation
4. Submit → Cloudflare Worker validates and creates a GitHub PR
5. Kit reviews and merges the PR
6. GitHub Action rebuilds configs.json → site redeploys with new persona

**Currently:** Submit button shows "Coming soon" until the Cloudflare Worker is built (Step 10).

**Key UX decisions:**
- Users never interact with GitHub directly
- Email is required but never included in the GitHub PR (Worker sends Kit a separate notification)
- Marketing opt-in checkbox is optional and NOT pre-checked (GDPR/CAN-SPAM compliant)
- Author handle is validated `[a-z0-9-]` with client-side availability check

---

## Validation Logic

### Build-Time Validation (validate-config.js)

Runs on all personas in `configs/` during `npm run validate` and as part of the build pipeline.

**File Requirements:**
- 2 required files: `IDENTITY.md`, `SOUL.md`
- Max total size: 50KB per persona

**Frontmatter Validation (IDENTITY.md):**
- `name`: string, 1-50 characters
- `emoji`: string, valid emoji
- `description`: string, 1-200 characters
- `tags`: array, 1-3 items from the tag whitelist
- `author`: string, GitHub-username format

**Content Checks:**
- Scans for prompt injection patterns (e.g., "ignore previous instructions", `<script>`, `javascript:`, `eval(`)
- Flags suspicious content but doesn't auto-reject (warns for human review)

**PII Detection (MVP — regex-based):**
- Scans for emails, phone numbers, IP addresses, API key patterns (`sk-ant-`, `ghp_`, `sk-`, `Bearer`, etc.)
- Warns but doesn't block — shows user a notice to review before sharing

### Client-Side Validation (/contribute page)

- Non-empty content in both text areas
- Total size under 50KB
- If frontmatter is present, validates field types and lengths
- Instant feedback (no server round-trip for preview/export)

### AI Coherence Validation (Post-MVP)

Planned but not yet implemented. Will use the Anthropic Claude API to check:
- Do files describe a coherent persona matching the name?
- Are there contradictions between IDENTITY.md and SOUL.md?
- Is this a legitimate persona or spam?

**Estimated cost:** ~$0.01 per validation (Anthropic API).

---

## Frontend Components

### Layout.astro
Base page template. Accepts `title` and `description` props. Includes `<head>` meta, Header, Footer, and a `<slot>` for page content. Handles dark mode class on `<html>`.

### Header.astro
Site header with navigation links (Browse, Contribute, About) and a dark mode toggle button. Responsive layout.

### Footer.astro
Site footer with GitHub link (PersonaKit org) and "Built by Kit Mithrandir" credit. Single column, minimal.

### PersonaCard.astro
Card component used in the homepage grid. Displays emoji, name, author, description, and tag pills. Links to the persona detail page. Hover shadow effect. Styled with The Forge palette (indigo/amber/stone).

### SearchBar.astro
Search input with a clear button. Keyboard shortcuts: `/` to focus, `Escape` to clear or blur. Debounced 150ms. Drives Fuse.js fuzzy search across name, description, tags, and author fields (weighted).

### TagFilter.astro
Clickable tag pills derived from actual persona data in configs.json. OR logic (selecting multiple tags shows personas matching any). Active state uses indigo highlight. Deselect by clicking again.

### CopyButton.astro
Copy-to-clipboard button with optional download. Used on persona detail pages for per-file copy/download of IDENTITY.md and SOUL.md. Shows "Copied!" confirmation feedback.

### ExportButton.astro
Platform export card with three actions: copy, download, and expandable "How to use" instructions. Used on both detail pages and /contribute. One card per platform (OpenClaw, Claude Code, Codex, Cursor, ChatGPT).

### Key Utilities

- **`src/utils/exports.ts`** — Server-side functions that generate each platform's export format. `withSecurity()` wraps content with the security template. Called at build time for detail pages and at runtime on /contribute.
- **`src/utils/markdown.ts`** — Unified pipeline: remark-parse → remark-gfm → remark-rehype → rehype-sanitize → rehype-stringify. Used to render user-submitted markdown safely.
- **`src/utils/search.ts`** — Fuse.js configuration and search helper.
- **`src/utils/types.ts`** — TypeScript interfaces for persona configs and metadata.
- **`src/security-template.md`** — Anti-prompt-injection ground rules injected into every export. Single source of truth — update here and rebuild to propagate.

---

## GitHub Actions

> **Status:** Not yet implemented. Workflow files are planned but `.github/workflows/` is currently empty.

### build-index.yml (Planned)

Triggers on push to `main` when `configs/**` files change. Runs validation, rebuilds `configs.json`, and commits the updated index.

**Security requirements:**
- Pinned action versions (SHA, not tags) to prevent supply chain attacks
- Least-privilege `GITHUB_TOKEN` permissions
- Never log secrets in workflow output

### validate-pr.yml (Planned)

Triggers on pull requests that modify `configs/**`. Runs `validate-config.js` against the changed persona. Comments on the PR if validation fails. Does not auto-merge — Kit reviews all submissions manually.

---

## Deployment

### Cloudflare Pages Setup

1. **Connect GitHub Repository**
   - Cloudflare dashboard → Pages → Create project → Connect to Git
   - Select personakit repository → Authorize Cloudflare

2. **Configure Build Settings**
   ```
   Framework preset: Astro
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Environment Variables**
   ```
   NODE_VERSION=20
   ```

4. **Custom Domain**
   - Add custom domain: personakit.dev
   - Add CNAME records in Porkbun DNS:
     ```
     Type: CNAME  Host: @    Answer: personakit.pages.dev  TTL: Auto
     Type: CNAME  Host: www  Answer: personakit.pages.dev  TTL: Auto
     ```

5. **Automatic Deployments**
   - Every push to `main` triggers build
   - Preview deployments for PRs
   - Rollback available in dashboard

### Security Headers (public/_headers)

Set via Cloudflare Pages `_headers` file:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy`
- Content Security Policy (CSP)
- HTTPS enforced by Cloudflare (automatic)

---

## Monetization Strategy

### Phase 1: Launch → 1K Visitors/Month (Months 1-3)

**Goal:** Validate concept, build audience

**Revenue Streams:**

1. **GitHub Sponsors** ($0-50/mo)
   - Tiers: $5 Supporter, $20 Contributor, $50 Partner

2. **Ko-fi Donations** ($0-50/mo)

3. **Affiliate Links** ($10-100/mo)
   - Cursor, Replit, Notion
   - Always disclosed

**Expected Total:** $30-250/mo

### Phase 2: 5K-10K Visitors/Month (Months 4-8)

4. **Sponsored Personas** ($400-1,000/mo)
5. **Carbon Ads** ($200-400/mo)
6. **Premium Template Packs** ($100-500/mo) via Gumroad

**Expected Total:** $700-1,900/mo

### Phase 3: 25K-50K Visitors/Month (Months 9-18)

7. **Mediavine/Ezoic** ($1,000-2,000/mo)
8. **Enterprise Licensing** ($1,000-1,500/mo)
9. **API Access** ($500-1,500/mo)

**Expected Total:** $2,500-5,000/mo

---

## Development Roadmap

### MVP (Steps 1-12)

- [x] Domain registered (personakit.dev)
- [x] Email setup (mithrandir@personakit.dev)
- [x] Astro + Tailwind project scaffolded (Step 1)
- [x] Components built: Layout, Header, Footer, PersonaCard (Steps 1-2)
- [x] 12 seed personas created in configs/ (Step 2)
- [x] Build scripts: build-index.js, validate-config.js (Step 2)
- [x] Homepage with persona card grid (Step 2)
- [x] Persona detail pages with platform exports (Step 3)
- [x] Search bar with Fuse.js fuzzy search (Step 4)
- [x] Tag filter with OR logic (Step 4)
- [x] Dark mode (system preference + manual toggle) (Steps 1-4)
- [x] /contribute page: paste → validate → preview → export (Step 9)
- [ ] Cloudflare Worker: receives submissions, creates GitHub PRs (Step 10)
- [ ] GitHub Actions: build-index.yml, validate-pr.yml (Step 11)
- [ ] Deploy to Cloudflare Pages (Step 12)

### Post-Launch (Weeks 3-4)
- Submit to Hacker News, Reddit
- Launch blog post
- GitHub Sponsors + Ko-fi
- Affiliate links

### Month 2-3 (Growth)
- SEO content
- Trending/featured sections
- Community reporting

### Month 4+ (Monetization)
- Carbon Ads
- Sponsor outreach
- Premium template packs
- Enterprise inquiry page

---

## Future Feature Ideas

### Persona Blend/Fuse (Paid Feature)
Select 2-3 personas → AI merges them into one IDENTITY.md + SOUL.md with context-switching rules (e.g., "when coding, be The Architect; when researching, be the Research Librarian"). Real use case validated by Kit's own workflow.

### AI-Powered Persona Builder (Post-MVP)
User describes a persona in a plain-language prompt → LLM generates IDENTITY.md + SOUL.md. Deferred due to API cost and because users can already do this with free LLMs. Could be a premium/supporter feature.

### LLM Provider Recommendations
Each persona could include recommended LLM providers paired to the task, with cost estimates and links (potential affiliate revenue). Example: a coding persona might recommend Kimi 2.5 (budget), Claude Sonnet (mid-tier), Claude Opus (premium). Display as a comparison table on detail pages.

### Personality Trait Sliders
Interactive slider dimensions for persona creation: Directness (gentle to blunt), Formality (casual to professional), Humor (serious to playful), Thinking Style (big picture to detail-oriented). Auto-generates the SOUL.md personality section.

### Random Persona Generator
A "Surprise Me" button that randomly rolls trait slider positions, a domain/role, an emoji, and a name. Turns persona creation into a discovery experience.

### Flavor Packs
Optional personality modifiers layered onto any persona: regional vibes (New Yorker directness, Southern hospitality), fandom flavors, era styles (90s internet, Victorian formal), professional tones (startup culture, academic). Community-created with content guidelines to avoid harmful stereotypes.

### Sub-Agent Positioning
Detail pages could include platform-specific instructions for adding a persona as a sub-agent (Claude Code skills/agents, Codex agents, etc.). Messaging supports both "Use as your main AI persona" and "Add as a specialist for a specific task."

### Download Counter / Popularity Tracking
MVP: Cloudflare Web Analytics (free, privacy-respecting, page views as popularity proxy). Post-MVP: Worker-based counter that pings on copy/download events, stores counts in Cloudflare KV. Rate-limited (1 count per persona per IP per hour). Display as "Copied X times" on persona cards.

### Duplicate / Similar Persona Detection
Three layers: (1) MVP: name matching against configs.json on submission. (2) Post-MVP: content similarity via Fuse.js fuzzy match on IDENTITY description. (3) Future: AI similarity check via Claude API. Some duplication is fine — only block literal copies.

### Direct Paste Metadata "Magic Fill"
Post-MVP: "Magic Fill" button on /contribute that uses AI to auto-extract metadata from pasted content — pre-populates name, emoji, description, and tags. User confirms and tweaks.

### Browse UX at Scale
- Up to ~100 personas: search + tag filter (current)
- 100-500: add pagination/load-more (24 per page), sort options (newest, popular, A-Z)
- 500-1000: category landing pages (/browse/coding, /browse/writing), featured = curated picks
- 1000+: homepage becomes hero + featured picks + search + category links. Full browse at /browse with faceted search.

### AI-Assisted Persona Review (Prompt Curation)
Monthly/quarterly script that sends each persona to Claude for review against current prompting best practices. Outputs improvement suggestions for Kit to review. Keeps personas fresh as prompting techniques evolve. Estimated cost: $1-2 per full catalog review.
