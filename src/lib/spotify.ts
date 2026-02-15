/**
 * Spotify API client for playlist sync.
 *
 * Uses Client Credentials flow to access public playlists
 * without requiring user OAuth.
 *
 * Requires SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.
 * Docs: https://developer.spotify.com/documentation/web-api
 */

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

export interface SpotifyTrack {
  title: string;
  artist: string;
  album: string | null;
  spotifyId: string;
  spotifyUrl: string;
  coverArtUrl: string | null;
}

export interface SpotifyPlaylistInfo {
  name: string;
  description: string | null;
  trackCount: number;
  imageUrl: string | null;
}

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

interface SpotifyPlaylistResponse {
  name: string;
  description: string | null;
  images: { url: string }[];
  tracks: SpotifyPaginatedTracks;
}

interface SpotifyPaginatedTracks {
  items: SpotifyTrackItem[];
  next: string | null;
  total: number;
}

interface SpotifyTrackItem {
  track: {
    id: string;
    name: string;
    artists: { name: string }[];
    album: {
      name: string;
      images: { url: string; width: number }[];
    };
    external_urls: { spotify: string };
  } | null;
}

let cachedToken: { token: string; expiresAt: number } | null = null;

/**
 * Get a Spotify access token using Client Credentials flow.
 */
async function getAccessToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token;
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET must be set");
  }

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get Spotify access token: ${response.status}`);
  }

  const data: SpotifyTokenResponse = await response.json();

  cachedToken = {
    token: data.access_token,
    // Expire 60 seconds early to avoid edge cases
    expiresAt: Date.now() + (data.expires_in - 60) * 1000,
  };

  return cachedToken.token;
}

/**
 * Extract a Spotify playlist ID from a URL or URI.
 *
 * Supports:
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
 * - https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=abc123
 * - spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
 * - 37i9dQZF1DXcBWIGoYBM5M (raw ID)
 */
export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();

  // Spotify URI format
  const uriMatch = trimmed.match(/^spotify:playlist:([a-zA-Z0-9]+)$/);
  if (uriMatch) return uriMatch[1];

  // Spotify URL format
  try {
    const url = new URL(trimmed);
    if (url.hostname === "open.spotify.com") {
      const parts = url.pathname.split("/");
      const playlistIdx = parts.indexOf("playlist");
      if (playlistIdx !== -1 && parts[playlistIdx + 1]) {
        return parts[playlistIdx + 1];
      }
    }
  } catch {
    // Not a URL, try as raw ID
  }

  // Raw playlist ID (alphanumeric, typically 22 chars)
  if (/^[a-zA-Z0-9]{15,}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Fetch playlist metadata and tracks from Spotify.
 */
export async function getPlaylistTracks(
  playlistId: string
): Promise<{ info: SpotifyPlaylistInfo; tracks: SpotifyTrack[] }> {
  // Validate playlist ID is strictly alphanumeric to prevent SSRF
  if (!/^[a-zA-Z0-9]+$/.test(playlistId)) {
    throw new Error("Invalid playlist ID");
  }

  const token = await getAccessToken();

  // Fetch playlist with first page of tracks
  const url = new URL(`${SPOTIFY_API_BASE}/playlists/${playlistId}`);
  url.searchParams.set(
    "fields",
    "name,description,images,tracks(items(track(id,name,artists(name),album(name,images),external_urls)),next,total)"
  );

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 404) {
    throw new Error("Playlist not found. Make sure the playlist is public.");
  }

  if (!response.ok) {
    throw new Error(`Spotify API error: ${response.status}`);
  }

  const data: SpotifyPlaylistResponse = await response.json();

  const info: SpotifyPlaylistInfo = {
    name: data.name,
    description: data.description,
    trackCount: data.tracks.total,
    imageUrl: data.images?.[0]?.url ?? null,
  };

  const tracks: SpotifyTrack[] = [];

  // Process first page
  addTracks(data.tracks.items, tracks);

  // Fetch remaining pages (Spotify returns max 100 per page)
  let nextUrl = data.tracks.next;
  while (nextUrl) {
    const pageResponse = await fetch(nextUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!pageResponse.ok) break;

    const pageData: SpotifyPaginatedTracks = await pageResponse.json();
    addTracks(pageData.items, tracks);
    nextUrl = pageData.next;
  }

  return { info, tracks };
}

function addTracks(items: SpotifyTrackItem[], out: SpotifyTrack[]) {
  for (const item of items) {
    if (!item.track) continue; // Skip null tracks (removed/unavailable)

    const albumImages = item.track.album.images;
    // Prefer medium-sized image (~300px)
    const coverArt =
      albumImages.find((img) => img.width === 300)?.url ??
      albumImages[0]?.url ??
      null;

    out.push({
      title: item.track.name,
      artist: item.track.artists.map((a) => a.name).join(", "),
      album: item.track.album.name || null,
      spotifyId: item.track.id,
      spotifyUrl: item.track.external_urls.spotify,
      coverArtUrl: coverArt,
    });
  }
}
