# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in PersonaKit, please report it responsibly.

**Email:** mithrandir@personakit.dev

**What to include:**
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

**What to expect:**
- Acknowledgment within 48 hours
- Status update within 7 days
- Credit in the fix (unless you prefer to remain anonymous)

**Please do not:**
- Open a public GitHub issue for security vulnerabilities
- Exploit the vulnerability beyond what's needed to demonstrate it
- Access or modify other users' data

## Scope

The following are in scope:
- personakit.dev website
- Cloudflare Worker API endpoints
- Persona file validation and sanitization
- Platform export functionality

The following are out of scope:
- Third-party services (Cloudflare, GitHub)
- Denial of service attacks
- Social engineering

## Security Measures

PersonaKit implements the following security controls:

- **Input sanitization:** All user-submitted markdown is sanitized via rehype-sanitize before rendering
- **Anti-prompt-injection:** Security rules are appended to all persona exports
- **PII detection:** Regex-based scan warns users about personal information in submissions
- **Content Security Policy:** Strict CSP headers via Cloudflare Pages
- **HTTPS:** Enforced by Cloudflare
- **File size limits:** 50KB max per persona submission
- **Path sanitization:** Slugs restricted to `[a-z0-9-]`
- **Rate limiting:** Submission endpoint limited to 3 requests per hour per IP
