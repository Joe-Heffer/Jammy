import { describe, it, expect } from "vitest";
import { buildChordifyUrl } from "./chordify";

describe("buildChordifyUrl", () => {
  it("builds a URL from title and artist", () => {
    expect(buildChordifyUrl("Come Together", "The Beatles")).toBe(
      "https://chordify.net/search/The%20Beatles%20Come%20Together"
    );
  });

  it("encodes special characters", () => {
    expect(buildChordifyUrl("Rock & Roll", "Led Zeppelin")).toBe(
      "https://chordify.net/search/Led%20Zeppelin%20Rock%20%26%20Roll"
    );
  });

  it("handles extra whitespace by normalizing", () => {
    expect(buildChordifyUrl("  Yesterday  ", "  The Beatles  ")).toBe(
      "https://chordify.net/search/The%20Beatles%20Yesterday"
    );
  });

  it("handles single-word artist and title", () => {
    expect(buildChordifyUrl("Creep", "Radiohead")).toBe(
      "https://chordify.net/search/Radiohead%20Creep"
    );
  });
});
