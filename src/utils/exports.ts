/**
 * Platform export generators.
 *
 * Each function takes a persona's raw files object and a persona name,
 * then produces a single string formatted for the target platform.
 * All exports include the security template (anti-prompt-injection rules).
 */

import securityTemplate from "../security-template.md?raw";

const FILE_ORDER = [
  "IDENTITY.md",
  "SOUL.md",
] as const;

type Files = Record<string, string>;

/** Human-readable section name from filename. */
function sectionName(filename: string): string {
  return filename.replace(".md", "").replace(/_/g, " ");
}

/** Only files that exist, in canonical order. */
function orderedEntries(files: Files): [string, string][] {
  return FILE_ORDER.filter((f) => files[f]).map((f) => [f, files[f]]);
}

/** Strip top-level markdown heading from content (e.g. "# Coach\n\n..." → "..."). */
function stripTitle(content: string): string {
  return content.replace(/^#\s+.+\n+/, "").trim();
}

/**
 * Compact version of the security template for ChatGPT (character-limited).
 * Extracts bullet points from the template and strips markdown bold markers.
 */
function compactSecurity(): string {
  return securityTemplate
    .split("\n")
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/\*\*/g, ""))
    .join("\n");
}

/**
 * Append the security template to raw file content.
 * Used for per-file copy/download (OpenClaw individual files).
 */
export function withSecurity(content: string): string {
  return `${content.trim()}\n\n---\n\n${securityTemplate.trim()}`;
}

/**
 * Claude Code — merged into a single CLAUDE.md.
 * Uses `# Section` headings with `---` separators.
 * Security template appended at the end.
 */
export function exportClaudeCode(files: Files, name: string): string {
  const sections = orderedEntries(files)
    .map(([fname, content]) => `# ${sectionName(fname)}\n\n${content.trim()}`)
    .join("\n\n---\n\n");

  return `${sections}\n\n---\n\n${securityTemplate.trim()}`;
}

/**
 * Codex — AGENTS.md format with role preamble.
 * Opens with a directive statement, then merges sections.
 * Security template appended at the end.
 */
export function exportCodex(files: Files, name: string): string {
  const preamble = `# ${name} Agent\n\nYou are the ${name} agent. Follow the persona and rules defined below.\n`;

  const sections = orderedEntries(files)
    .map(([fname, content]) => `## ${sectionName(fname)}\n\n${stripTitle(content)}`)
    .join("\n\n");

  return `${preamble}\n${sections}\n\n${securityTemplate.trim()}`;
}

/**
 * Cursor — .cursorrules format.
 * Uses directive/instruction tone. Sections as rules blocks.
 * Security template appended at the end.
 */
export function exportCursor(files: Files, name: string): string {
  const preamble = `# Rules for AI: ${name}\n\nAlways follow these rules when assisting the user.\n`;

  const sections = orderedEntries(files)
    .map(([fname, content]) => {
      const label = sectionName(fname);
      return `## ${label}\n\n${stripTitle(content)}`;
    })
    .join("\n\n");

  return `${preamble}\n${sections}\n\n${securityTemplate.trim()}`;
}

/**
 * ChatGPT — condensed plain text for the custom instructions field.
 * Character limit is tight (~1,500 chars), so we prioritize:
 * IDENTITY (who), SOUL personality + style (how), and boundaries.
 * Other files are omitted to stay within limits.
 * Security template appended in compact form.
 */
export function exportChatGPT(files: Files, name: string): string {
  const parts: string[] = [];

  // Identity — core role description
  if (files["IDENTITY.md"]) {
    parts.push(`[Who you are]\n${stripTitle(files["IDENTITY.md"])}`);
  }

  // Soul — personality and style (most important for ChatGPT)
  if (files["SOUL.md"]) {
    parts.push(`[Personality & style]\n${stripTitle(files["SOUL.md"])}`);
  }

  // Compact security rules derived from the template
  parts.push(`[Ground rules]\n${compactSecurity()}`);

  return parts.join("\n\n");
}
