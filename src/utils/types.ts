export const TAG_WHITELIST = [
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
] as const;

export type Tag = (typeof TAG_WHITELIST)[number];

export interface PersonaIdentity {
  name: string;
  emoji: string;
  description: string;
  tags: Tag[];
  author: string;
}

export interface PersonaConfig {
  slug: string;
  identity: PersonaIdentity;
  files: {
    identity: string;
    soul: string;
  };
}
