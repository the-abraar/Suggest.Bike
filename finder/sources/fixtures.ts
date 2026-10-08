import { readFileSync } from "node:fs";
import type { Listing } from "../../src/lib/finder";
import type { SourceAdapter } from "../types";

/** Returns canned listings for tests and demos. No network. */
export function fixturesAdapter(file: string): SourceAdapter {
  return {
    name: "fixtures",
    async search() {
      return JSON.parse(readFileSync(file, "utf8")) as Listing[];
    },
  };
}
