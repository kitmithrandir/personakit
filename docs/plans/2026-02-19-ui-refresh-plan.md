# PersonaKit UI Refresh — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish the PersonaKit UI with better visual hierarchy, micro-animations, sort/filter UX, related personas, and social meta tags — without changing the site's DNA.

**Architecture:** All changes are CSS + Astro template modifications. No new dependencies. Card animations use CSS transitions with `prefers-reduced-motion` respect. Sort uses existing client-side JS pattern. OG tags use Astro's built-in `<meta>` support.

**Tech Stack:** Astro 5, Tailwind CSS v4, vanilla JS/TS

---

### Task 1: CSS Foundations — Animation Utilities

Add global CSS utilities for card transitions and reduced-motion support.

**Files:**
- Modify: `src/styles/global.css`

**Step 1: Add animation utilities to global.css**

Add after the existing `.dark body` block:

```css
/* Card transitions */
.card-animate {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

@media (prefers-reduced-motion: no-preference) {
  .card-animate:hover {
    transform: translateY(-2px);
  }
}

/* Smooth filter transitions for persona grid items */
.persona-item {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.persona-item[data-hidden] {
  opacity: 0;
  transform: scale(0.97);
  pointer-events: none;
  position: absolute;
  visibility: hidden;
}
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build, no errors.

**Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add CSS animation utilities for card transitions"
```

---

### Task 2: Header — Brand Icon

Add a small SVG spark icon before "PersonaKit" in the header.

**Files:**
- Modify: `src/components/Header.astro`

**Step 1: Add spark icon SVG before brand text**

Replace the existing brand link `<a>` in Header.astro (lines 13-17):

```astro
<a href="/" class="flex items-center gap-2 group">
  <svg class="w-6 h-6 text-amber-500 dark:text-amber-400" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
  </svg>
  <span class="text-xl font-bold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-300 transition-colors">
    PersonaKit
  </span>
</a>
```

The icon is a 4-pointed star/spark in amber (the accent color from the design system).

**Step 2: Verify build + visual check**

Run: `npm run build`
Expected: Clean build. Header shows amber spark icon left of "PersonaKit".

**Step 3: Commit**

```bash
git add src/components/Header.astro
git commit -m "feat: add spark brand icon to header"
```

---

### Task 3: Hero Section Enhancements

Add persona count stat, dot grid background, and keyboard shortcut hint.

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Step 1: Add dot grid pattern CSS**

Add to the end of `src/styles/global.css`:

```css
/* Subtle dot grid for hero background */
.dot-grid {
  background-image: radial-gradient(circle, #d6d3d1 1px, transparent 1px);
  background-size: 24px 24px;
}

.dark .dot-grid {
  background-image: radial-gradient(circle, #44403C 1px, transparent 1px);
}
```

**Step 2: Update hero section in index.astro**

In index.astro, the hero section (lines 31-54) becomes:

```astro
<!-- Hero -->
<section class="text-center py-12 sm:py-16 relative">
  <div class="absolute inset-0 dot-grid opacity-50 pointer-events-none" aria-hidden="true"></div>
  <div class="relative">
    <h1 class="text-4xl sm:text-5xl font-bold tracking-tight">
      AI personas,
      <span class="text-indigo-600 dark:text-indigo-400">ready to use</span>
    </h1>
    <p class="mt-4 text-lg sm:text-xl text-forge-muted dark:text-forge-muted-dark max-w-2xl mx-auto">
      Find the right specialist for any task — coding, writing, research, brainstorming, and more. Ready to use with OpenClaw, Claude, ChatGPT, Cursor, or any AI platform.
    </p>
    <p class="mt-3 text-sm text-forge-muted dark:text-forge-muted-dark">
      {personas.length} personas across {allTags.length} categories
    </p>
    <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
      <a
        href="#search-section"
        class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-medium rounded-lg transition-colors"
      >
        Browse Personas
      </a>
      <a
        href="/contribute"
        class="px-6 py-3 border border-forge-border dark:border-forge-border-dark hover:bg-stone-50 dark:hover:bg-stone-800 font-medium rounded-lg transition-colors"
      >
        Contribute a Persona
      </a>
    </div>
  </div>
</section>
```

**Step 3: Add keyboard shortcut hint to search section**

Replace the search section (lines 57-60) with:

```astro
<!-- Search & Filter -->
<section id="search-section" class="py-4 space-y-4">
  <div class="relative">
    <SearchBar />
    <span class="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center px-1.5 py-0.5 text-xs font-mono text-forge-muted dark:text-forge-muted-dark border border-forge-border dark:border-forge-border-dark rounded" id="search-hint" aria-hidden="true">/</span>
  </div>
  <TagFilter tags={allTags} />
</section>
```

Note: The search hint needs to be positioned outside the SearchBar component to avoid z-index conflicts. The hint hides when the search input has focus (handled by existing JS — we'll add a small script addition).

**Step 4: Add hint hide/show to the existing script block**

In the `<script>` block of index.astro, add after the keyboard shortcuts section (after line 258):

```typescript
// Hide "/" hint when search is focused
const searchHint = document.getElementById("search-hint");
if (searchHint) {
  searchInput.addEventListener("focus", () => { searchHint.style.display = "none"; });
  searchInput.addEventListener("blur", () => {
    if (!searchQuery) searchHint.style.display = "";
  });
}
```

**Step 5: Verify build**

Run: `npm run build`
Expected: Clean build. Hero shows dot grid background, persona count, and search shows "/" hint.

**Step 6: Commit**

```bash
git add src/pages/index.astro src/styles/global.css
git commit -m "feat: enhance hero with dot grid, persona count, and search hint"
```

---

### Task 4: PersonaCard Visual Polish

Add emoji circle background, hover lift+shadow, and author avatar.

**Files:**
- Modify: `src/components/PersonaCard.astro`

**Step 1: Update PersonaCard template**

Replace the full contents of PersonaCard.astro (after frontmatter):

```astro
<a href={`/persona/${slug}`} class="block group">
  <article class="card-animate h-full border border-forge-border dark:border-forge-border-dark rounded-xl p-6 bg-forge-surface dark:bg-forge-surface-dark hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all">
    <div class="mb-3">
      <span class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-3xl" role="img" aria-label={name}>{emoji}</span>
    </div>
    <h3 class="text-lg font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      {name}
    </h3>
    <p class="mt-2 text-sm text-forge-muted dark:text-forge-muted-dark line-clamp-2">
      {description}
    </p>
    <div class="mt-4 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span class="text-xs px-2 py-1 rounded-md bg-stone-200 dark:bg-stone-700 text-forge-muted dark:text-forge-muted-dark">
          {tag}
        </span>
      ))}
    </div>
    <div class="mt-4 flex items-center gap-2">
      <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-stone-300 dark:bg-stone-600 text-[10px] font-bold text-stone-600 dark:text-stone-300 uppercase">{author.charAt(0)}</span>
      <span class="text-xs text-forge-muted dark:text-forge-muted-dark">{author}</span>
    </div>
  </article>
</a>
```

Key changes:
- `card-animate` class on article for hover lift (from Task 1 CSS)
- `hover:shadow-lg` instead of `hover:shadow-md`
- Emoji gets a rounded background box (`w-12 h-12 rounded-xl bg-indigo-50`)
- Author line gets a small avatar circle with first letter

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build. Cards show emoji backgrounds, lift on hover, and author avatars.

**Step 3: Commit**

```bash
git add src/components/PersonaCard.astro
git commit -m "feat: polish persona cards with emoji background, hover lift, and author avatar"
```

---

### Task 5: Smooth Card Filter Transitions

Replace instant show/hide with fade transitions when search/filter changes.

**Files:**
- Modify: `src/pages/index.astro` (script section only)

**Step 1: Update the card show/hide logic**

In the `update()` function in index.astro's `<script>` block, replace the "Show/hide cards" section (around line 170-172):

```typescript
// Show/hide cards with smooth transitions
cards.forEach((card) => {
  const shouldShow = visibleSlugs.has(card.dataset.slug!);
  if (shouldShow) {
    card.removeAttribute("data-hidden");
    card.style.display = "";
  } else {
    card.setAttribute("data-hidden", "");
    // Delay display:none to allow fade-out animation
    setTimeout(() => {
      if (card.hasAttribute("data-hidden")) {
        card.style.display = "none";
      }
    }, 200);
  }
});
```

Also, update the grid style handling (around line 185):

```typescript
// No results state
const hasResults = count > 0;
noResults.classList.toggle("hidden", hasResults);
grid.style.display = count === 0 ? "none" : "";
```

No change needed — the grid display logic stays the same, the individual card animation handles the visual transition.

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build. Cards fade out smoothly when filtered.

**Step 3: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: smooth card fade transitions on search/filter"
```

---

### Task 6: Search & Filter UX — Sort Dropdown

Add a sort dropdown with "Featured", "A–Z", and "Author" options.

**Files:**
- Modify: `src/pages/index.astro`

**Step 1: Add sort dropdown to search section**

In index.astro, update the search section to include a sort control. Replace the search section:

```astro
<!-- Search & Filter -->
<section id="search-section" class="py-4 space-y-4">
  <div class="flex gap-3 items-center">
    <div class="relative flex-1">
      <SearchBar />
      <span class="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center px-1.5 py-0.5 text-xs font-mono text-forge-muted dark:text-forge-muted-dark border border-forge-border dark:border-forge-border-dark rounded" id="search-hint" aria-hidden="true">/</span>
    </div>
    <select
      id="sort-select"
      class="px-3 py-3 rounded-lg border border-forge-border dark:border-forge-border-dark bg-forge-surface dark:bg-forge-surface-dark text-sm text-forge-text dark:text-forge-text-dark focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent cursor-pointer"
      aria-label="Sort personas"
    >
      <option value="featured">Featured</option>
      <option value="az">A–Z</option>
      <option value="author">Author</option>
    </select>
  </div>
  <TagFilter tags={allTags} />
</section>
```

**Step 2: Add sort logic to the script block**

Add after the state declarations (after line 137 `const activeTags = new Set<string>();`):

```typescript
let sortMode = "featured";
const sortSelect = document.getElementById("sort-select") as HTMLSelectElement;

// Original card order (for "featured" = default file order)
const originalOrder = Array.from(cards).map((c) => c.dataset.slug!);
```

Update the `update()` function. After the "Show/hide cards" block, add sort logic before the heading update:

```typescript
// Sort visible cards
const gridEl = document.getElementById("persona-grid")!;
const visibleCards = Array.from(cards).filter(
  (c) => visibleSlugs.has(c.dataset.slug!)
);

if (sortMode === "az") {
  visibleCards.sort((a, b) => {
    const nameA = personas.find((p) => p.slug === a.dataset.slug!)?.name ?? "";
    const nameB = personas.find((p) => p.slug === b.dataset.slug!)?.name ?? "";
    return nameA.localeCompare(nameB);
  });
} else if (sortMode === "author") {
  visibleCards.sort((a, b) => {
    const authA = personas.find((p) => p.slug === a.dataset.slug!)?.author ?? "";
    const authB = personas.find((p) => p.slug === b.dataset.slug!)?.author ?? "";
    return authA.localeCompare(authB) || (
      (personas.find((p) => p.slug === a.dataset.slug!)?.name ?? "").localeCompare(
        personas.find((p) => p.slug === b.dataset.slug!)?.name ?? ""
      )
    );
  });
} else {
  // Featured = original order
  visibleCards.sort((a, b) =>
    originalOrder.indexOf(a.dataset.slug!) - originalOrder.indexOf(b.dataset.slug!)
  );
}

// Reorder DOM
for (const card of visibleCards) {
  gridEl.appendChild(card);
}
```

Add the sort event listener (after the tag toggle listeners):

```typescript
// Sort change
sortSelect.addEventListener("change", () => {
  sortMode = sortSelect.value;
  update();
});
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Clean build. Sort dropdown appears next to search, sorting works for all 3 modes.

**Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "feat: add sort dropdown (Featured, A-Z, Author) to homepage"
```

---

### Task 7: Tag Filter — Smoother Active State

Improve tag filter transitions for a more polished feel.

**Files:**
- Modify: `src/components/TagFilter.astro`

**Step 1: Update TagFilter styles**

Replace the `<style>` block in TagFilter.astro:

```css
.tag-btn {
  transition: all 0.15s ease;
}
.tag-btn[data-active] {
  border-color: #4f46e5;
  color: #ffffff;
  background-color: #4f46e5;
}
:global(.dark) .tag-btn[data-active] {
  border-color: #818cf8;
  color: #ffffff;
  background-color: rgba(99, 102, 241, 0.4);
}
```

Change: active tags now have a filled background (indigo) with white text, instead of just border+text color change. Adds `transition: all 0.15s ease` for smoothness.

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build. Active tags fill with indigo background.

**Step 3: Commit**

```bash
git add src/components/TagFilter.astro
git commit -m "feat: improve tag filter with filled active state and smooth transitions"
```

---

### Task 8: Persona Detail Page — Related Personas

Add "You might also like" section at the bottom of detail pages.

**Files:**
- Modify: `src/pages/persona/[...slug].astro`

**Step 1: Add related personas computation**

In the frontmatter of `[...slug].astro`, after the platform exports section (after line 55), add:

```typescript
// Find related personas (share at least one tag, exclude self)
const allPersonas = configsData as Persona[];
const relatedPersonas = allPersonas
  .filter((p) => p.slug !== persona.slug && p.tags.some((t: string) => persona.tags.includes(t)))
  .sort(() => Math.random() - 0.5) // shuffle
  .slice(0, 3);
```

**Step 2: Add PersonaCard import**

At the top of the frontmatter, add the import (after line 2):

```typescript
import PersonaCard from "../../components/PersonaCard.astro";
```

**Step 3: Add related personas section**

Add before the closing `</Layout>` tag (after line 188):

```astro
{relatedPersonas.length > 0 && (
  <section class="mt-16 pt-8 border-t border-forge-border dark:border-forge-border-dark">
    <h2 class="text-lg font-semibold mb-6">You might also like</h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {relatedPersonas.map((rp) => (
        <PersonaCard
          slug={rp.slug}
          name={rp.name}
          emoji={rp.emoji}
          description={rp.description}
          tags={rp.tags}
          author={rp.author}
        />
      ))}
    </div>
  </section>
)}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Clean build. Detail pages show related personas at the bottom. The random shuffle means each build shows different combos — that's fine for static.

**Step 5: Commit**

```bash
git add src/pages/persona/[...slug].astro
git commit -m "feat: add related personas section to detail pages"
```

---

### Task 9: Persona Detail Page — Platform Icons in Export Sidebar

Add small recognizable icons to each export button for visual scanning.

**Files:**
- Modify: `src/pages/persona/[...slug].astro`

**Step 1: Add platform icon SVGs as inline elements**

In `[...slug].astro`, update each `<ExportButton>` to include an icon prefix. Since ExportButton doesn't support slot content, we'll wrap each one. Replace the export sidebar content (lines 131-185) with:

```astro
<ExportButton
  platform="Claude Code"
  description="Saves as CLAUDE.md"
  text={claudeCode}
  filename="CLAUDE.md"
  instructions="Save as CLAUDE.md in your project root folder. Claude Code reads it automatically when you start a conversation in that project."
/>
<ExportButton
  platform="Codex"
  description="Saves as AGENTS.md"
  text={codex}
  filename="AGENTS.md"
  instructions="Save as AGENTS.md in your repository root. Codex CLI picks it up automatically as the agent's instructions."
/>
<ExportButton
  platform="Cursor"
  description="Saves as .cursorrules"
  text={cursor}
  filename=".cursorrules"
  instructions="Save as .cursorrules in your project root folder. Cursor reads it automatically and applies the rules to every AI chat in that project."
/>
<ExportButton
  platform="ChatGPT"
  description="Paste as first message"
  text={chatgpt}
  filename="chatgpt.txt"
  instructions={'Start a new ChatGPT conversation and paste this as your first message. ChatGPT will adopt the persona for that entire chat. (Too long for the Custom Instructions field — use the first-message method instead.)'}
/>

<div class="border border-forge-border dark:border-forge-border-dark rounded-lg p-4">
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      <p class="font-medium text-sm">OpenClaw</p>
      <p class="text-xs text-forge-muted dark:text-forge-muted-dark mt-0.5">Uses individual .md files</p>
    </div>
    <a
      href="#persona-files"
      class="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
    >
      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5" />
      </svg>
      <span>Files</span>
    </a>
  </div>
  <details class="mt-2">
    <summary class="text-xs text-forge-muted dark:text-forge-muted-dark cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors select-none">
      How to use
    </summary>
    <p class="mt-1.5 text-xs text-forge-muted dark:text-forge-muted-dark leading-relaxed">
      OpenClaw uses individual .md files natively. Copy or download each file from the sections below. Place them in your OpenClaw persona directory (e.g. ~/.openclaw/personas/this-persona/).
    </p>
  </details>
</div>
```

Note: The export sidebar structure stays the same. The real improvement here is adding a small colored dot/indicator per platform inside ExportButton itself. Update ExportButton.astro to add a platform color indicator.

**Step 2: Add platform color dots to ExportButton**

In `src/components/ExportButton.astro`, replace the platform name line (line 16):

```astro
<p class="font-medium text-sm">{platform}</p>
```

with:

```astro
<p class="font-medium text-sm flex items-center gap-1.5">
  <span class="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shrink-0" aria-hidden="true"></span>
  {platform}
</p>
```

This adds a small indigo dot before each platform name for visual scanning.

**Step 3: Verify build**

Run: `npm run build`
Expected: Clean build. Export buttons show small colored dots.

**Step 4: Commit**

```bash
git add src/pages/persona/[...slug].astro src/components/ExportButton.astro
git commit -m "feat: add platform indicator dots to export buttons"
```

---

### Task 10: About Page — Feature Cards

Replace prose paragraphs with visually distinct feature cards.

**Files:**
- Modify: `src/pages/about.astro`

**Step 1: Rewrite about page with feature cards**

Replace the full content of about.astro (keeping the frontmatter):

```astro
---
import Layout from "../layouts/Layout.astro";
---

<Layout title="About" description="Learn about PersonaKit and its mission to make AI personas accessible to everyone.">
  <section class="py-12 sm:py-16 max-w-3xl">
    <h1 class="text-3xl sm:text-4xl font-bold">About PersonaKit</h1>
    <div class="mt-6 space-y-4 text-forge-muted dark:text-forge-muted-dark leading-relaxed">
      <p>
        PersonaKit is a community-driven marketplace for AI persona configurations. We make it easy to discover, share, and fork the markdown files that define how AI assistants behave.
      </p>
      <p>
        Whether you use OpenClaw, Claude, ChatGPT, Cursor, or Codex, PersonaKit gives you ready-to-use persona configs that you can copy with a single click and customize to fit your needs.
      </p>
    </div>

    <h2 class="text-xl font-semibold text-forge-text dark:text-forge-text-dark mt-10 mb-6">How it works</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div class="p-5 rounded-xl border border-forge-border dark:border-forge-border-dark bg-forge-surface dark:bg-forge-surface-dark">
        <span class="text-2xl" aria-hidden="true">&#x1FAAA;</span>
        <h3 class="mt-3 font-semibold text-forge-text dark:text-forge-text-dark">Identity</h3>
        <p class="mt-2 text-sm text-forge-muted dark:text-forge-muted-dark">
          IDENTITY.md defines who the persona is — name, role, and what it specializes in.
        </p>
      </div>
      <div class="p-5 rounded-xl border border-forge-border dark:border-forge-border-dark bg-forge-surface dark:bg-forge-surface-dark">
        <span class="text-2xl" aria-hidden="true">&#x2728;</span>
        <h3 class="mt-3 font-semibold text-forge-text dark:text-forge-text-dark">Soul</h3>
        <p class="mt-2 text-sm text-forge-muted dark:text-forge-muted-dark">
          SOUL.md defines how it behaves — personality, tone, communication style, and boundaries.
        </p>
      </div>
      <div class="p-5 rounded-xl border border-forge-border dark:border-forge-border-dark bg-forge-surface dark:bg-forge-surface-dark">
        <span class="text-2xl" aria-hidden="true">&#x1F4E6;</span>
        <h3 class="mt-3 font-semibold text-forge-text dark:text-forge-text-dark">Export</h3>
        <p class="mt-2 text-sm text-forge-muted dark:text-forge-muted-dark">
          One-click export for Claude Code, Codex, Cursor, ChatGPT, or use natively with OpenClaw.
        </p>
      </div>
    </div>

    <h2 class="text-xl font-semibold text-forge-text dark:text-forge-text-dark mt-10">Built by Kit Mithrandir</h2>
    <p class="mt-3 text-forge-muted dark:text-forge-muted-dark leading-relaxed">
      PersonaKit is an open-source project. Questions, ideas, or contributions are welcome on
      <a href="https://github.com/kitmithrandir/personakit" class="text-indigo-600 dark:text-indigo-400 hover:underline">GitHub</a>.
    </p>

    <div class="mt-10 flex flex-wrap gap-3">
      <a
        href="/"
        class="px-5 py-2.5 text-sm font-medium rounded-lg bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
      >
        Browse Personas
      </a>
      <a
        href="/contribute"
        class="px-5 py-2.5 text-sm font-medium rounded-lg border border-forge-border dark:border-forge-border-dark hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
      >
        Contribute a Persona
      </a>
    </div>
  </section>
</Layout>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build. About page shows 3 feature cards and CTA buttons.

**Step 3: Commit**

```bash
git add src/pages/about.astro
git commit -m "feat: redesign about page with feature cards and CTAs"
```

---

### Task 11: Social Meta — OG Tags

Add Open Graph and Twitter Card meta tags for better link sharing.

**Files:**
- Modify: `src/layouts/Layout.astro`
- Create: `public/og-image.svg` (simple branded OG image)

**Step 1: Create OG image**

Create `public/og-image.svg` — a simple branded card (SVG renders fine as OG image on most platforms):

```svg
<svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#1C1917"/>
  <text x="600" y="280" text-anchor="middle" fill="#818CF8" font-family="system-ui, sans-serif" font-size="72" font-weight="bold">PersonaKit</text>
  <text x="600" y="350" text-anchor="middle" fill="#A8A29E" font-family="system-ui, sans-serif" font-size="32">AI personas, ready to use</text>
  <text x="600" y="420" text-anchor="middle" fill="#78716C" font-family="system-ui, sans-serif" font-size="24">personakit.dev</text>
</svg>
```

**Step 2: Update Layout.astro with OG + Twitter meta tags**

In Layout.astro, add meta tags after the existing `<meta name="description">` line (after line 20):

```astro
<!-- Open Graph -->
<meta property="og:title" content={pageTitle} />
<meta property="og:description" content={description} />
<meta property="og:type" content="website" />
<meta property="og:url" content={`https://personakit.dev${Astro.url.pathname}`} />
<meta property="og:image" content="https://personakit.dev/og-image.svg" />
<meta property="og:site_name" content="PersonaKit" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={pageTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content="https://personakit.dev/og-image.svg" />
```

**Step 3: Verify build**

Run: `npm run build`
Expected: Clean build. OG image exists in dist/. Meta tags appear in page source.

**Step 4: Commit**

```bash
git add src/layouts/Layout.astro public/og-image.svg
git commit -m "feat: add Open Graph and Twitter Card meta tags"
```

---

### Task 12: Footer — Persona Count

Add a small persona stat to the footer.

**Files:**
- Modify: `src/components/Footer.astro`

**Step 1: Add persona count**

In Footer.astro, add persona count import and display. Update the frontmatter:

```astro
---
import configsData from "../../public/configs.json";
const year = new Date().getFullYear();
const personaCount = (configsData as unknown[]).length;
---
```

Replace the footer copyright line (line 9) with:

```astro
<p class="text-sm text-forge-muted dark:text-forge-muted-dark">
  &copy; {year} PersonaKit &middot; {personaCount} personas and counting &middot; Built by
  <a href="mailto:mithrandir@personakit.dev" class="hover:text-forge-text dark:hover:text-forge-text-dark transition-colors">Kit Mithrandir</a>.
</p>
```

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build. Footer shows "24 personas and counting".

**Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "feat: add persona count to footer"
```

---

### Task 13: Detail Page — Emoji + Author Polish

Apply the same emoji circle + author avatar treatment from PersonaCard to the detail page header.

**Files:**
- Modify: `src/pages/persona/[...slug].astro`

**Step 1: Update persona header**

Replace the metadata header (lines 71-91) with:

```astro
<header class="mb-8">
  <div class="flex items-start gap-4">
    <span class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-5xl shrink-0" role="img" aria-label={persona.name}>{persona.emoji}</span>
    <div class="min-w-0">
      <div class="flex items-center gap-3 flex-wrap">
        <h1 class="text-3xl font-bold">{persona.name}</h1>
      </div>
      <p class="mt-2 text-lg text-forge-muted dark:text-forge-muted-dark">{persona.description}</p>
      <div class="mt-3 flex flex-wrap items-center gap-2">
        {persona.tags.map((tag: string) => (
          <span class="text-xs px-2 py-1 rounded-md bg-stone-200 dark:bg-stone-700 text-forge-muted dark:text-forge-muted-dark">
            {tag}
          </span>
        ))}
        <span class="text-xs text-forge-muted dark:text-forge-muted-dark flex items-center gap-1.5">
          &middot;
          <span class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-stone-300 dark:bg-stone-600 text-[9px] font-bold text-stone-600 dark:text-stone-300 uppercase">{persona.author.charAt(0)}</span>
          {persona.author}
        </span>
      </div>
    </div>
  </div>
</header>
```

Key changes:
- Emoji gets a rounded background box (`w-16 h-16 rounded-2xl bg-indigo-50`)
- Author line gets the same avatar circle treatment as PersonaCard
- `shrink-0` on emoji to prevent flex squishing

**Step 2: Verify build**

Run: `npm run build`
Expected: Clean build. Detail page header shows emoji background and author avatar.

**Step 3: Commit**

```bash
git add src/pages/persona/[...slug].astro
git commit -m "feat: polish detail page header with emoji background and author avatar"
```

---

## Summary of Changes

| Task | Area | Impact |
|------|------|--------|
| 1 | CSS foundations | Low — utility classes |
| 2 | Header brand icon | Low — amber spark |
| 3 | Hero enhancements | Medium — count, dots, hint |
| 4 | PersonaCard polish | High — emoji bg, hover, avatar |
| 5 | Card filter transitions | Medium — smooth fade |
| 6 | Sort dropdown | High — new functionality |
| 7 | Tag filter active state | Low — visual tweak |
| 8 | Related personas | High — new feature |
| 9 | Platform dots | Low — visual scanning |
| 10 | About page cards | Medium — visual upgrade |
| 11 | OG meta tags | Medium — social sharing |
| 12 | Footer count | Low — small addition |
| 13 | Detail page polish | Medium — consistency |

**Zero new dependencies. All changes are CSS + Astro templates + vanilla JS.**
