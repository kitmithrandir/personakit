/**
 * Cloudflare Pages Function: POST /api/submit
 *
 * Receives persona submissions from the /contribute page.
 * Flow: Turnstile verify → honeypot check → validate → create GitHub PR
 *
 * Required env vars (set in Cloudflare Pages dashboard):
 *   TURNSTILE_SECRET_KEY — Cloudflare Turnstile secret
 *   GITHUB_TOKEN         — GitHub PAT with repo scope
 *   GITHUB_REPO          — e.g. "kitmithrandir/personakit"
 */

const TAG_WHITELIST = new Set([
  "coding", "creative", "support", "humor", "productivity",
  "research", "writing", "analysis", "teaching", "gaming",
  "technical", "professional", "casual", "friendly", "direct",
]);

const SLUG_PATTERN = /^[a-z0-9-]+$/;
const MAX_SIZE = 50 * 1024; // 50 KB

// ── Helpers ──────────────────────────────────────────────

function jsonResponse(status, data) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Convert a persona name to a URL-safe slug. */
function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Strip YAML frontmatter (if present) and return only the body. */
function stripFrontmatter(content) {
  const trimmed = content.trim();
  if (!trimmed.startsWith("---")) return trimmed;
  const end = trimmed.indexOf("---", 3);
  if (end === -1) return trimmed;
  return trimmed.slice(end + 3).trim();
}

/** Build IDENTITY.md with proper frontmatter + body content. */
function buildIdentityMd({ name, emoji, description, tags, author, body }) {
  const fm = [
    "---",
    `name: "${name}"`,
    `emoji: "${emoji}"`,
    `description: "${description}"`,
    `tags: [${tags.map((t) => `"${t}"`).join(", ")}]`,
    `author: "${author}"`,
    "---",
  ].join("\n");
  return fm + "\n\n" + body;
}

/** Base64-encode a UTF-8 string (works in Workers runtime). */
function toBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

/** Verify a Turnstile token with Cloudflare's API. */
async function verifyTurnstile(token, secret, ip) {
  const form = new FormData();
  form.append("secret", secret);
  form.append("response", token);
  if (ip) form.append("remoteip", ip);

  const res = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    { method: "POST", body: form },
  );
  const data = await res.json();
  return data.success === true;
}

/** Make an authenticated GitHub API call. */
async function github(env, method, path, body) {
  const res = await fetch(
    `https://api.github.com/repos/${env.GITHUB_REPO}${path}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${env.GITHUB_TOKEN}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "PersonaKit-Submission/1.0",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: body ? JSON.stringify(body) : undefined,
    },
  );
  const data = await res.json();
  if (!res.ok) {
    const msg = data.message || res.statusText;
    throw new Error(`GitHub ${method} ${path} → ${res.status}: ${msg}`);
  }
  return data;
}

// ── Server-side validation ───────────────────────────────

function validate(body) {
  const errors = [];
  const { identity, soul, name, emoji, description, tags, author, email } = body;

  if (!identity || typeof identity !== "string" || !identity.trim()) {
    errors.push("IDENTITY.md content is required");
  }
  if (!soul || typeof soul !== "string" || !soul.trim()) {
    errors.push("SOUL.md content is required");
  }

  if (errors.length === 0) {
    const size =
      new TextEncoder().encode(identity).length +
      new TextEncoder().encode(soul).length;
    if (size > MAX_SIZE) {
      errors.push("Total size exceeds 50 KB limit");
    }
  }

  if (!name || typeof name !== "string" || !name.trim() || name.trim().length > 50) {
    errors.push("Valid persona name required (1-50 characters)");
  }
  if (!emoji || typeof emoji !== "string" || !emoji.trim()) {
    errors.push("Emoji is required");
  }
  if (
    !description ||
    typeof description !== "string" ||
    !description.trim() ||
    description.trim().length > 200
  ) {
    errors.push("Valid description required (1-200 characters)");
  }
  if (
    !Array.isArray(tags) ||
    tags.length < 1 ||
    tags.length > 3 ||
    !tags.every((t) => typeof t === "string" && TAG_WHITELIST.has(t))
  ) {
    errors.push("1-3 valid tags required");
  }
  if (
    !author ||
    typeof author !== "string" ||
    !SLUG_PATTERN.test(author) ||
    author.length > 40
  ) {
    errors.push("Valid author handle required (lowercase letters, numbers, hyphens)");
  }
  if (
    !email ||
    typeof email !== "string" ||
    !email.includes("@") ||
    !email.includes(".")
  ) {
    errors.push("Valid email address required");
  }

  return errors;
}

// ── Request handler ──────────────────────────────────────

export async function onRequestPost(context) {
  const { request, env } = context;

  // Parse JSON body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(400, { success: false, error: "Invalid request body" });
  }

  // Honeypot — silently "succeed" so bots think it worked
  if (body.hp) {
    return jsonResponse(200, { success: true });
  }

  // Turnstile verification (skipped if secret not configured — local dev)
  if (env.TURNSTILE_SECRET_KEY) {
    const ip = request.headers.get("CF-Connecting-IP") || "";
    const ok = await verifyTurnstile(
      body.turnstileToken || "",
      env.TURNSTILE_SECRET_KEY,
      ip,
    );
    if (!ok) {
      return jsonResponse(403, {
        success: false,
        error: "Bot verification failed. Please refresh and try again.",
      });
    }
  }

  // Server-side field validation
  const errors = validate(body);
  if (errors.length > 0) {
    return jsonResponse(400, { success: false, error: errors.join(". ") + "." });
  }

  // Sanitised values
  const name = body.name.trim();
  const emoji = body.emoji.trim();
  const description = body.description.trim();
  const tags = body.tags;
  const author = body.author.trim();
  const email = body.email.trim();
  const marketing = !!body.marketing;

  const slug = slugify(name);
  if (!slug) {
    return jsonResponse(400, {
      success: false,
      error: "Could not generate a valid URL slug from the persona name.",
    });
  }

  // ── GitHub API: branch → files → PR ──

  try {
    // Check if this persona already exists on main
    const existsRes = await fetch(
      `https://api.github.com/repos/${env.GITHUB_REPO}/contents/configs/${author}/${slug}`,
      {
        headers: {
          Authorization: `Bearer ${env.GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "User-Agent": "PersonaKit-Submission/1.0",
        },
      },
    );
    if (existsRes.ok) {
      return jsonResponse(409, {
        success: false,
        error:
          "A persona with this name already exists for this author. Please choose a different name.",
      });
    }

    // 1. Get main branch SHA
    const mainRef = await github(env, "GET", "/git/ref/heads/main");
    const mainSha = mainRef.object.sha;

    // 2. Create submission branch
    const ts = Date.now();
    const branch = `submissions/${author}/${slug}-${ts}`;
    await github(env, "POST", "/git/refs", {
      ref: `refs/heads/${branch}`,
      sha: mainSha,
    });

    // 3. Prepare file content
    const identityBody = stripFrontmatter(body.identity);
    const identityMd = buildIdentityMd({
      name,
      emoji,
      description,
      tags,
      author,
      body: identityBody,
    });
    const soulMd = body.soul.trim();

    // 4. Create IDENTITY.md on the branch
    await github(env, "PUT", `/contents/configs/${author}/${slug}/IDENTITY.md`, {
      message: `Add persona: ${author}/${slug}`,
      content: toBase64(identityMd),
      branch,
    });

    // 5. Create SOUL.md on the branch
    await github(env, "PUT", `/contents/configs/${author}/${slug}/SOUL.md`, {
      message: `Add SOUL.md for ${author}/${slug}`,
      content: toBase64(soulMd),
      branch,
    });

    // 6. Open pull request
    const prBody = [
      "## New Persona Submission",
      "",
      `**Name:** ${emoji} ${name}`,
      `**Author:** ${author}`,
      `**Tags:** ${tags.join(", ")}`,
      `**Description:** ${description}`,
      "",
      "---",
      "*Submitted via personakit.dev*",
      "",
      `<!-- SUBMITTER_EMAIL: ${email} -->`,
      `<!-- MARKETING_OPTIN: ${marketing ? "yes" : "no"} -->`,
    ].join("\n");

    const pr = await github(env, "POST", "/pulls", {
      title: `New persona: ${emoji} ${name}`,
      body: prBody,
      head: branch,
      base: "main",
    });

    return jsonResponse(200, { success: true, prUrl: pr.html_url });
  } catch (err) {
    // Log for Cloudflare dashboard, don't expose internals to client
    console.error("Submission failed:", err.message);
    return jsonResponse(500, {
      success: false,
      error: "Something went wrong creating your submission. Please try again later.",
    });
  }
}

// Reject other methods
export async function onRequestGet() {
  return jsonResponse(405, { error: "Method not allowed" });
}
