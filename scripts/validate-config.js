import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const CONFIGS_DIR = path.resolve(import.meta.dirname, "..", "configs");

const TAG_WHITELIST = new Set([
  "coding",
  "creative",
  "support",
  "humor",
  "productivity",
  "research",
  "writing",
  "analysis",
  "teaching",
  "gaming",
  "technical",
  "professional",
  "casual",
  "friendly",
  "direct",
]);

const REQUIRED_FILES = ["IDENTITY.md", "SOUL.md"];

const OPTIONAL_FILES = [];

const ALL_KNOWN_FILES = [...REQUIRED_FILES, ...OPTIONAL_FILES];

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const MAX_PERSONA_SIZE_BYTES = 50 * 1024; // 50KB

/**
 * Validate a single persona directory.
 * Returns an array of error strings (empty = valid).
 */
export function validatePersona(authorDir, personaDir) {
  const errors = [];
  const author = path.basename(authorDir);
  const slug = path.basename(personaDir);
  const personaPath = path.join(authorDir, personaDir);

  // Slug format
  if (!SLUG_PATTERN.test(slug)) {
    errors.push(`Slug "${slug}" contains invalid characters (must be [a-z0-9-])`);
  }
  if (!SLUG_PATTERN.test(author)) {
    errors.push(`Author "${author}" contains invalid characters (must be [a-z0-9-])`);
  }

  // Path traversal check
  const resolved = path.resolve(CONFIGS_DIR, author, slug);
  if (!resolved.startsWith(CONFIGS_DIR)) {
    errors.push(`Path traversal detected: ${author}/${slug}`);
    return errors; // bail early — don't read files from outside configs/
  }

  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    errors.push(`Not a directory: ${resolved}`);
    return errors;
  }

  // Check total size
  const files = fs.readdirSync(resolved);
  let totalSize = 0;
  for (const file of files) {
    const filePath = path.join(resolved, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      totalSize += stat.size;
    }
  }
  if (totalSize > MAX_PERSONA_SIZE_BYTES) {
    errors.push(`Total size ${totalSize} bytes exceeds ${MAX_PERSONA_SIZE_BYTES} byte limit`);
  }

  // Check for unknown files
  for (const file of files) {
    if (!ALL_KNOWN_FILES.includes(file)) {
      errors.push(`Unknown file: ${file}`);
    }
  }

  // Required files
  for (const req of REQUIRED_FILES) {
    if (!files.includes(req)) {
      errors.push(`Missing required file: ${req}`);
    }
  }

  if (!files.includes("IDENTITY.md")) {
    return errors; // can't validate frontmatter without IDENTITY.md
  }

  // Parse IDENTITY.md frontmatter
  const identityPath = path.join(resolved, "IDENTITY.md");
  const identityRaw = fs.readFileSync(identityPath, "utf-8");

  let parsed;
  try {
    parsed = matter(identityRaw);
  } catch (e) {
    errors.push(`Failed to parse IDENTITY.md frontmatter: ${e.message}`);
    return errors;
  }

  const { data } = parsed;

  // Required frontmatter fields
  if (!data.name || typeof data.name !== "string") {
    errors.push("Missing or invalid frontmatter field: name");
  } else if (data.name.length < 1 || data.name.length > 50) {
    errors.push(`Name length ${data.name.length} out of range (1-50)`);
  }

  if (!data.emoji || typeof data.emoji !== "string") {
    errors.push("Missing or invalid frontmatter field: emoji");
  }

  if (!data.description || typeof data.description !== "string") {
    errors.push("Missing or invalid frontmatter field: description");
  } else if (data.description.length < 1 || data.description.length > 200) {
    errors.push(`Description length ${data.description.length} out of range (1-200)`);
  }

  if (!data.author || typeof data.author !== "string") {
    errors.push("Missing or invalid frontmatter field: author");
  } else if (data.author !== author) {
    errors.push(`Frontmatter author "${data.author}" doesn't match directory author "${author}"`);
  }

  // Tags validation
  if (!Array.isArray(data.tags)) {
    errors.push("Missing or invalid frontmatter field: tags (must be array)");
  } else {
    if (data.tags.length < 1 || data.tags.length > 3) {
      errors.push(`Tags count ${data.tags.length} out of range (1-3)`);
    }
    for (const tag of data.tags) {
      if (!TAG_WHITELIST.has(tag)) {
        errors.push(`Invalid tag: "${tag}"`);
      }
    }
  }

  // Check that body content exists in IDENTITY.md
  if (!parsed.content || parsed.content.trim().length === 0) {
    errors.push("IDENTITY.md has no body content (only frontmatter)");
  }

  // Check that SOUL.md has content
  if (files.includes("SOUL.md")) {
    const soulPath = path.join(resolved, "SOUL.md");
    const soulContent = fs.readFileSync(soulPath, "utf-8").trim();
    if (soulContent.length === 0) {
      errors.push("SOUL.md is empty");
    }
  }

  return errors;
}

/**
 * Validate all personas in configs/ directory.
 * Returns { valid: number, invalid: number, results: [...] }
 */
export function validateAll() {
  const results = [];

  if (!fs.existsSync(CONFIGS_DIR)) {
    console.error(`Configs directory not found: ${CONFIGS_DIR}`);
    process.exit(1);
  }

  const authors = fs.readdirSync(CONFIGS_DIR).filter((d) => {
    return fs.statSync(path.join(CONFIGS_DIR, d)).isDirectory();
  });

  for (const author of authors) {
    const authorPath = path.join(CONFIGS_DIR, author);
    const personas = fs.readdirSync(authorPath).filter((d) => {
      return fs.statSync(path.join(authorPath, d)).isDirectory();
    });

    for (const persona of personas) {
      const errors = validatePersona(author, persona);
      results.push({
        path: `${author}/${persona}`,
        valid: errors.length === 0,
        errors,
      });
    }
  }

  return {
    valid: results.filter((r) => r.valid).length,
    invalid: results.filter((r) => !r.valid).length,
    results,
  };
}

// CLI entry point
if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  const { valid, invalid, results } = validateAll();

  for (const result of results) {
    if (result.valid) {
      console.log(`  ✓ ${result.path}`);
    } else {
      console.log(`  ✗ ${result.path}`);
      for (const err of result.errors) {
        console.log(`    → ${err}`);
      }
    }
  }

  console.log(`\n${valid} valid, ${invalid} invalid`);

  if (invalid > 0) {
    process.exit(1);
  }
}
