/**
 * Last.fm API client for song recommendations.
 *
 * Uses track.getSimilar and artist.getSimilar to find songs
 * based on artists already in the jam list.
 *
 * Requires LASTFM_API_KEY environment variable.
 * Docs: https://www.last.fm/api
 */

const LASTFM_BASE_URL = "https://ws.audioscrobbler.com/2.0/";

export interface LastFmTrack {
  name: string;
  artist: { name: string };
  image?: { "#text": string; size: string }[];
  url?: string;
  match?: number;
}

export interface LastFmArtist {
  name: string;
  match?: number;
}

interface LastFmSimilarTracksResponse {
  similartracks?: {
    track?: LastFmTrack[];
  };
}

interface LastFmSimilarArtistsResponse {
  similarartists?: {
    artist?: LastFmArtist[];
  };
}

interface LastFmTopTracksResponse {
  toptracks?: {
    track?: { name: string; artist: { name: string } }[];
  };
}

export interface Recommendation {
  title: string;
  artist: string;
  imageUrl: string | null;
  lastfmUrl: string | null;
  seedArtist: string;
  match: number;
}

function getApiKey(): string | null {
  return process.env.LASTFM_API_KEY || null;
}

async function lastfmFetch<T>(params: Record<string, string>): Promise<T | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const url = new URL(LASTFM_BASE_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  if (!response.ok) return null;
  return response.json() as Promise<T>;
}

/**
 * Get similar tracks from Last.fm based on a track name and artist.
 */
export async function getSimilarTracks(
  track: string,
  artist: string,
  limit = 10
): Promise<LastFmTrack[]> {
  const data = await lastfmFetch<LastFmSimilarTracksResponse>({
    method: "track.getSimilar",
    track,
    artist,
    limit: String(limit),
    autocorrect: "1",
  });

  return data?.similartracks?.track ?? [];
}

/**
 * Get similar artists from Last.fm.
 */
export async function getSimilarArtists(
  artist: string,
  limit = 5
): Promise<LastFmArtist[]> {
  const data = await lastfmFetch<LastFmSimilarArtistsResponse>({
    method: "artist.getSimilar",
    artist,
    limit: String(limit),
    autocorrect: "1",
  });

  return data?.similarartists?.artist ?? [];
}

/**
 * Get top tracks for an artist from Last.fm.
 */
export async function getArtistTopTracks(
  artist: string,
  limit = 3
): Promise<{ name: string; artist: string }[]> {
  const data = await lastfmFetch<LastFmTopTracksResponse>({
    method: "artist.getTopTracks",
    artist,
    limit: String(limit),
    autocorrect: "1",
  });

  return (
    data?.toptracks?.track?.map((t) => ({
      name: t.name,
      artist: t.artist.name,
    })) ?? []
  );
}

/**
 * Extract the best image URL from Last.fm image array.
 * Prefers "extralarge" or "large" sizes.
 */
function extractImageUrl(images?: { "#text": string; size: string }[]): string | null {
  if (!images || images.length === 0) return null;
  const preferred = ["extralarge", "large", "medium"];
  for (const size of preferred) {
    const img = images.find((i) => i.size === size);
    if (img && img["#text"]) return img["#text"];
  }
  const last = images[images.length - 1];
  return last?.["#text"] || null;
}

/**
 * Get recommendations for a set of artists.
 * Returns tracks grouped by seed artist, deduplicated against existing songs.
 */
export async function getRecommendations(
  artists: string[],
  existingTitlesLower: Set<string>,
  maxPerArtist = 6
): Promise<Record<string, Recommendation[]>> {
  const results: Record<string, Recommendation[]> = {};

  // Sample up to 5 artists to avoid too many API calls
  const sampledArtists = artists.slice(0, 5);

  await Promise.all(
    sampledArtists.map(async (artist) => {
      try {
        // Get top tracks for this artist to use as seeds
        const topTracks = await getArtistTopTracks(artist, 2);

        // Get similar tracks from each top track
        const trackPromises = topTracks.map((t) =>
          getSimilarTracks(t.name, t.artist, maxPerArtist)
        );

        // Also get similar artists and their top tracks
        const similarArtistsPromise = getSimilarArtists(artist, 3);

        const [similarArtists, ...trackResults] = await Promise.all([
          similarArtistsPromise,
          ...trackPromises,
        ]);

        // Get top tracks from similar artists
        const similarArtistTracks = await Promise.all(
          similarArtists.map((sa) => getArtistTopTracks(sa.name, 2))
        );

        // Collect all recommendations
        const seen = new Set<string>();
        const recs: Recommendation[] = [];

        // Add similar tracks
        for (const tracks of trackResults) {
          for (const track of tracks) {
            const key = `${track.name.toLowerCase()}|${track.artist.name.toLowerCase()}`;
            if (seen.has(key)) continue;
            if (existingTitlesLower.has(key)) continue;
            seen.add(key);
            recs.push({
              title: track.name,
              artist: track.artist.name,
              imageUrl: extractImageUrl(track.image),
              lastfmUrl: track.url || null,
              seedArtist: artist,
              match: typeof track.match === "number" ? track.match : 0,
            });
          }
        }

        // Add top tracks from similar artists
        for (const artistTracks of similarArtistTracks) {
          for (const track of artistTracks) {
            const key = `${track.name.toLowerCase()}|${track.artist.toLowerCase()}`;
            if (seen.has(key)) continue;
            if (existingTitlesLower.has(key)) continue;
            seen.add(key);
            recs.push({
              title: track.name,
              artist: track.artist,
              imageUrl: null,
              lastfmUrl: null,
              seedArtist: artist,
              match: 0,
            });
          }
        }

        if (recs.length > 0) {
          // Sort by match score descending, take top results
          recs.sort((a, b) => b.match - a.match);
          results[artist] = recs.slice(0, maxPerArtist);
        }
      } catch (error) {
        console.error(`Error fetching recommendations for ${artist}:`, error);
      }
    })
  );

  return results;
}
