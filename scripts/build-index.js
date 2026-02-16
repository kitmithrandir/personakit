import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { validatePersona } from "./validate-config.js";

const CONFIGS_DIR = path.resolve(import.meta.dirname, "..", "configs");
const OUTPUT_PATH = path.resolve(import.meta.dirname, "..", "public", "configs.json");

const PERSONA_FILES = [
  "IDENTITY.md",
  "SOUL.md",
];

function buildIndex() {
  if (!fs.existsSync(CONFIGS_DIR)) {
    console.error(`Configs directory not found: ${CONFIGS_DIR}`);
    process.exit(1);
  }

  const personas = [];
  let errors = 0;

  const authors = fs
    .readdirSync(CONFIGS_DIR)
    .filter((d) => fs.statSync(path.join(CONFIGS_DIR, d)).isDirectory())
    .sort();

  for (const author of authors) {
    const authorPath = path.join(CONFIGS_DIR, author);
    const personaDirs = fs
      .readdirSync(authorPath)
      .filter((d) => fs.statSync(path.join(authorPath, d)).isDirectory())
      .sort();

    for (const personaSlug of personaDirs) {
      const personaPath = path.join(authorPath, personaSlug);

      // Validate first
      const validationErrors = validatePersona(author, personaSlug);
      if (validationErrors.length > 0) {
        console.error(`  ✗ ${author}/${personaSlug}:`);
        for (const err of validationErrors) {
          console.error(`    → ${err}`);
        }
        errors++;
        continue;
      }

      // Parse IDENTITY.md
      const identityPath = path.join(personaPath, "IDENTITY.md");
      const identityRaw = fs.readFileSync(identityPath, "utf-8");
      const { data: frontmatter, content: identityBody } = matter(identityRaw);

      // Read all available files
      const files = {};
      for (const fileName of PERSONA_FILES) {
        const filePath = path.join(personaPath, fileName);
        if (fs.existsSync(filePath)) {
          if (fileName === "IDENTITY.md") {
            // Store body only (frontmatter is already extracted)
            files[fileName] = identityBody.trim();
          } else {
            files[fileName] = fs.readFileSync(filePath, "utf-8").trim();
          }
        }
      }

      // Determine which files are present
      const presentFiles = PERSONA_FILES.filter((f) =>
        fs.existsSync(path.join(personaPath, f))
      );

      personas.push({
        slug: `${author}/${personaSlug}`,
        name: frontmatter.name,
        emoji: frontmatter.emoji,
        description: frontmatter.description,
        tags: frontmatter.tags,
        author: frontmatter.author,
        files_present: presentFiles,
        files,
      });

      console.log(`  ✓ ${author}/${personaSlug}`);
    }
  }

  if (errors > 0) {
    console.error(`\n${errors} persona(s) failed validation. Fix errors and retry.`);
    process.exit(1);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_PATH);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(personas, null, 2));
  console.log(`\nGenerated ${OUTPUT_PATH} with ${personas.length} personas`);
}

buildIndex();
