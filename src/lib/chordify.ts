/**
 * Chordify URL helpers.
 *
 * Constructs search URLs so users land directly on chord results
 * for a given song. Used to auto-populate chordChartUrl when no
 * manual URL is provided.
 */

/**
 * Build a Chordify search URL from a song title and artist.
 *
 * @example
 * buildChordifyUrl("Come Together", "The Beatles")
 * // => "https://chordify.net/search/The%20Beatles%20Come%20Together"
 */
export function buildChordifyUrl(title: string, artist: string): string {
  const query = `${artist} ${title}`.replace(/\s+/g, " ").trim();
  return `https://chordify.net/search/${encodeURIComponent(query)}`;
}
