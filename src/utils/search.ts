import Fuse from "fuse.js";
import type { PersonaConfig } from "./types";

const fuseOptions: Fuse.IFuseOptions<PersonaConfig> = {
  keys: [
    { name: "identity.name", weight: 2 },
    { name: "identity.description", weight: 1.5 },
    { name: "identity.tags", weight: 1 },
    { name: "identity.author", weight: 0.5 },
  ],
  threshold: 0.4,
  includeScore: true,
};

export function createSearch(personas: PersonaConfig[]): Fuse<PersonaConfig> {
  return new Fuse(personas, fuseOptions);
}

export function searchPersonas(
  fuse: Fuse<PersonaConfig>,
  query: string,
): PersonaConfig[] {
  if (!query.trim()) return [];
  return fuse.search(query).map((result) => result.item);
}
