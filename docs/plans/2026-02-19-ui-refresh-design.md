# PersonaKit UI Refresh — Design Document

**Date:** 2026-02-19
**Author:** Kit Mithrandir + Claude
**Approach:** Conservative polish — same DNA, clearly better

## Goals

- Make the site feel like a polished product, not a template
- Add missing UX features (sort, related personas, persona count)
- Improve visual hierarchy and micro-interactions
- Better social sharing (OG tags)
- All changes are CSS-only or minimal JS — no new dependencies

## 1. Hero Section

- Add persona count line: "24 personas across coding, writing, research, and more" (auto-generated from data)
- Add subtle CSS-only decorative dot grid pattern behind hero text for visual depth
- Add keyboard shortcut hint near search: `/ to search` badge

## 2. PersonaCards

- Hover effect: subtle lift (translateY -2px) + shadow increase
- Emoji background: soft colored circle behind emoji (light indigo in light mode, dark indigo in dark mode)
- Fade transitions: cards fade in/out smoothly when search/filter changes (opacity + transform CSS transitions)
- Author line: small colored circle with first letter of author name (avatar-like)

## 3. Header

- Add a small brand icon/mark SVG before "PersonaKit" text
- No other changes

## 4. Search & Filter

- Sort dropdown: small select next to search bar — "Featured" (default), "A–Z", "Author"
- Result count: already shown in heading, make styling more prominent
- Tag filter: active tags get filled background treatment, smoother transitions

## 5. Persona Detail Page

- Related personas: "You might also like" row at bottom — 3 cards sharing at least one tag
- Export sidebar: add small platform icon SVGs for visual scanning
- No layout changes

## 6. Micro-animations (CSS-only)

- Card hover lift + shadow
- Smooth card filter transitions (opacity + transform)
- Copy button: smoother green flash transition
- Tag pills: smooth background-color transition on toggle

## 7. About Page

- Break "How it works" into 3 feature cards with icons (Identity, Soul, Export)
- Add CTA at bottom to browse or contribute

## 8. Social Meta (OG Tags)

- Add og:title, og:description, og:image, twitter:card to Layout.astro
- Create generic OG image (1200x630) — styled text card with PersonaKit branding
- Per-persona pages get dynamic og:title and og:description

## 9. Footer

- Add persona count stat ("24 personas and counting")
- Otherwise unchanged

## Out of Scope

- Author profile pages
- Skeleton loading states
- Contribute page redesign
- Animated hero or gradient effects
- New dependencies
