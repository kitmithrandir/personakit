# PersonaKit

## Project Overview

PersonaKit is a community-driven marketplace for AI persona configurations. Users discover, share, and fork markdown-based persona files (IDENTITY.md + SOUL.md) that define AI personas for OpenClaw, Claude Desktop, ChatGPT, and other AI platforms.

**Domain:** personakit.dev
**Creator:** Kit Mithrandir (mithrandir@personakit.dev)

## Tech Stack

- **Framework:** Astro (static site generator, v4+)
- **Styling:** Tailwind CSS v4
- **Search:** Fuse.js (client-side fuzzy search)
- **Hosting:** Cloudflare Pages (free tier)
- **Database:** GitHub repo (configs stored as markdown files)
- **Validation:** Anthropic Claude API (coherence checks on advanced uploads)
- **Submission API:** Cloudflare Workers (serverless)
- **CI/CD:** GitHub Actions

## Commands

```bash
npm run dev        # Start dev server (localhost:4321)
npm run build      # Build for production (output: dist/)
npm run preview    # Preview production build locally
```

## Project Structure

```
personakit/
├── src/
│   ├── layouts/Layout.astro          # Base page template
│   ├── components/                   # Astro components
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PersonaCard.astro         # Persona grid card
│   │   ├── SearchBar.astro           # Search input with clear button
│   │   ├── TagFilter.astro           # Tag filter pills
│   │   ├── CopyButton.astro          # Copy + optional download button
│   │   └── ExportButton.astro        # Platform export with copy, download, "How to use"
│   ├── pages/
│   │   ├── index.astro               # Homepage (persona grid + search/filter)
│   │   ├── contribute.astro          # Paste → preview/export → submit
│   │   ├── about.astro               # About page
│   │   └── persona/[...slug].astro   # Dynamic persona detail pages
│   ├── styles/global.css             # Tailwind imports + global styles
│   ├── security-template.md          # Anti-prompt-injection rules (raw imported)
│   └── utils/
│       ├── markdown.ts               # Unified remark → rehype → sanitize pipeline
│       └── exports.ts                # Platform export generators + withSecurity()
├── public/
│   ├── configs.json                  # Auto-generated persona index
│   ├── favicon.ico
│   └── robots.txt
├── configs/                          # User-submitted personas
│   └── {username}/{persona-name}/
│       ├── IDENTITY.md               # Required: name, emoji, tags
│       └── SOUL.md                   # Required: personality, boundaries
├── scripts/
│   ├── build-index.js                # Generates configs.json from configs/
│   ├── validate-config.js            # Syntax/size/field validation
│   └── validate-coherence.js         # AI validation (Anthropic API)
├── functions/api/submit.js           # Cloudflare Worker endpoint
└── .github/workflows/
    ├── build-index.yml               # Auto-generate configs.json
    └── validate-pr.yml               # Validate PRs before merge
```

## Persona File Schema

PersonaKit is OpenClaw-native but platform-agnostic. Personas are stored as markdown files matching the OpenClaw spec, with export buttons for Claude Code, Codex, Cursor, ChatGPT, etc.

### Required Files
- **IDENTITY.md** — Frontmatter: name (1-50 chars), emoji, description (1-200 chars), tags (1-3 from whitelist), author. Body: role description.
- **SOUL.md** — Personality, tone, communication style, boundaries, values.

### Platform Exports (on detail pages + /contribute)
- Copy for OpenClaw (native per-file copy/download)
- Copy for Claude Code (merged into CLAUDE.md format)
- Copy for Codex (AGENTS.md format)
- Copy for Cursor (.cursorrules format)
- Copy for ChatGPT (plain text, paste as first message)

### Tag Whitelist
coding, creative, support, humor, productivity, research, writing, analysis, teaching, gaming, technical, professional, casual, friendly, direct

## Submission Flow

Single path: `/contribute` page. Two-tier usage:
1. **Export tool** — Paste any IDENTITY.md + SOUL.md content (no frontmatter required). Get instant preview + platform exports. No submission needed.
2. **Community submission** — After previewing, fill in metadata form (name, emoji, description, tags, author, email) and submit. Frontmatter auto-fills these fields if present. Submit currently shows "coming soon" until the Cloudflare Worker is built (Step 10).

## Conventions

- Astro components use `.astro` extension
- TypeScript for utility files
- Tailwind for all styling (no custom CSS except global.css)
- Client-side interactivity via Astro island architecture (`client:load` / `client:visible`)
- Configs stored as flat markdown files in `configs/` directory
- configs.json is auto-generated — never edit manually

## Security Requirements

Security is a first-class concern, not an afterthought. Apply security-by-design at every layer.

### Frameworks
- **OWASP Top 10** — mitigate all applicable categories
- **NIST SP 800-53** — apply relevant controls for a public web application
- **STRIDE threat model** — consider Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege for every feature

### Input Handling (Critical — user-submitted markdown)
- **Never render raw user markdown as HTML without sanitization.** All user-submitted persona content must be sanitized before display. Use a strict allowlist of HTML elements/attributes.
- **Reject prompt injection patterns** in uploaded persona files (regex scan for "ignore previous instructions," system prompt overrides, script injection, etc.)
- **Validate all frontmatter fields** with strict types, lengths, and allowlists. Never trust client-side validation alone — always validate server-side/build-time too.
- **Enforce file size limits** (50KB max per persona) to prevent resource exhaustion.
- **Sanitize filenames and paths** — prevent path traversal (e.g., `../../etc/passwd`). Persona slugs must match `[a-z0-9-]` only.

### XSS Prevention
- Astro's default templating auto-escapes output. Never use `set:html` or `innerHTML` with unsanitized user content.
- When rendering persona markdown content, use a markdown renderer with HTML sanitization (e.g., `marked` + `DOMPurify` or `rehype-sanitize`).
- CSP (Content Security Policy) headers via Cloudflare Pages `_headers` file.

### Dependency Security
- Pin dependency versions in package.json (exact versions, not ranges).
- Run `npm audit` as part of CI. Fail builds on high/critical vulnerabilities.
- Minimize dependencies — every dependency is attack surface.

### GitHub Actions Security
- Use pinned action versions (SHA, not tags) to prevent supply chain attacks.
- Apply least-privilege for GITHUB_TOKEN permissions.
- Never log secrets or tokens in workflow output.

### Cloudflare Pages Headers
- Set security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, CSP.
- HTTPS enforced by Cloudflare (automatic).

### Data Privacy
- No user accounts in MVP = no PII stored.
- No analytics that tracks individual users. If analytics are added later, use privacy-respecting options (e.g., Plausible, not Google Analytics).
- No cookies in MVP beyond what Cloudflare sets.

### PII Detection (MVP)
- Regex-based scan on all persona files before display/export: emails, phone numbers, IP addresses, API key patterns (`sk-ant-`, `ghp_`, `sk-`, `Bearer`, etc.)
- **Warn, don't block.** Show user a yellow notice: "We detected what looks like personal information. Please review before sharing." Allow override.
- Post-MVP: Add AI-powered PII scan via Anthropic API alongside coherence checking.

### User Experience for Existing OpenClaw Users
- **Per-file copy buttons** on detail pages (not just whole-persona export). Experienced users cherry-pick individual files.
- **Usage instructions address both scenarios:** "Starting fresh? Copy all files." / "Already have a setup? Browse individual files and merge what you like."
- **Privacy reminder** on create/submit flows: "Review your files for personal information before sharing."

### Security Tooling
- Proactively recommend third-party security tools, scanners, and vulnerability assessment services as relevant during development.
- For each recommendation, include: what it does, cost (free vs paid), pros and cons, and whether it's needed now or later.
- Examples to evaluate: Snyk, Socket.dev, GitHub Dependabot, npm audit, OWASP ZAP, Lighthouse security audits, Cloudflare WAF.

### What NOT to Commit
- Never commit `.env`, API keys, tokens, credentials, or secrets.
- `.gitignore` must include: `.env`, `.env.*`, `node_modules/`, `.claude/settings.local.json`, `CLAUDE.local.md`.

## Brand Voice & Visual Identity

- Professional but playful, approachable
- Subtle LOTR Easter eggs okay, no wizard roleplay
- No corporate jargon

### Color Palette — "The Forge"

**Light Mode:**
- Background: `#FAFAF9` (warm white/stone-50)
- Surface/cards: `#FFFFFF` with warm gray borders
- Primary: `#4F46E5` (indigo-600) — buttons, links, key actions
- Accent: `#F59E0B` (amber-500) — highlights, badges, hover states
- Text: `#1C1917` (stone-900)
- Muted text: `#78716C` (stone-500)

**Dark Mode:**
- Background: `#1C1917` (stone-900)
- Surface/cards: `#292524` (stone-800) with subtle borders
- Primary: `#818CF8` (indigo-400) — lighter for dark backgrounds
- Accent: `#FBBF24` (amber-400) — glowing amber on dark
- Text: `#FAFAF9` (stone-50)
- Muted text: `#A8A29E` (stone-400)

**Tailwind mapping:** Use `stone` for neutrals (warm grays), `indigo` for primary, `amber` for accent.

**Dark mode:** Supported from MVP. Use Tailwind `dark:` variants with system preference detection + manual toggle.

## How to Work With Kit (Product Owner)

### Principles
- Kit is the product owner. He makes decisions, I make them happen.
- Kit is not a developer but is tech-savvy and can read code. Translate technical concepts to plain language. Explain what I'm doing as I go — he wants to learn.
- This is a real, working product — not a mockup or prototype. It should look professional and feel finished.
- Push back if something doesn't make sense, is overcomplicating things, or is heading down a bad path.
- Be honest about limitations. Adjusted expectations beat disappointment.
- Move fast, but not so fast Kit can't follow what's happening.

### Workflow
1. **Discovery** — Ask questions to understand actual needs. Challenge assumptions. Separate "must have now" from "add later." If the scope is too big, suggest a smarter starting point.
2. **Planning** — Propose MVP and phases clearly. Explain technical approach in plain language. Estimate complexity (simple/medium/ambitious). Identify needed accounts, services, decisions.
3. **Building** — Build in visible stages Kit can react to. Test before moving on. Stop and check in at key decision points. If hitting a problem, present options instead of just picking one.
4. **Polish** — Professional quality, not hackathon. Handle edge cases gracefully. Fast and responsive on all devices. Small details that make it feel finished.
5. **Handoff** — Deploy when ready. Clear instructions for use, maintenance, and changes. Document everything so Kit isn't dependent on a single conversation. Outline what to add/improve in future phases.

### Rules
- Keep Kit in control and in the loop at all times
- Don't overwhelm with jargon
- The product should be something Kit is proud to show people
