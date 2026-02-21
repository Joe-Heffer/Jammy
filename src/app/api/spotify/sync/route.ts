import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { songs } from "@/lib/db/schema";
import { extractPlaylistId, getPlaylistTracks } from "@/lib/spotify";
import { buildChordifyUrl } from "@/lib/chordify";

/**
 * POST /api/spotify/sync
 * Sync a public Spotify playlist into the jam list.
 *
 * Body: { playlistUrl: string, addedBy?: string }
 * Returns: { added: number, skipped: number, playlistName: string, songs: Song[] }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.playlistUrl) {
      return NextResponse.json(
        { error: "playlistUrl is required" },
        { status: 400 }
      );
    }

    const playlistId = extractPlaylistId(body.playlistUrl);
    if (!playlistId) {
      return NextResponse.json(
        { error: "Invalid Spotify playlist URL. Provide a link like https://open.spotify.com/playlist/..." },
        { status: 400 }
      );
    }

    // Fetch tracks from Spotify
    const { info, tracks } = await getPlaylistTracks(playlistId);

    // Get all existing songs to check for duplicates
    const existingSongs = await db.select({ title: songs.title, artist: songs.artist }).from(songs);
    const existingSet = new Set(
      existingSongs.map((s) => `${s.title.toLowerCase()}|${s.artist.toLowerCase()}`)
    );

    const addedSongs = [];
    let skipped = 0;

    for (const track of tracks) {
      const key = `${track.title.toLowerCase()}|${track.artist.toLowerCase()}`;
      if (existingSet.has(key)) {
        skipped++;
        continue;
      }

      // Mark as seen to avoid duplicates within the playlist itself
      existingSet.add(key);

      const result = await db
        .insert(songs)
        .values({
          title: track.title,
          artist: track.artist,
          album: track.album,
          status: "want_to_jam",
          spotifyId: track.spotifyId,
          spotifyUrl: track.spotifyUrl,
          coverArtUrl: track.coverArtUrl,
          chordChartUrl: buildChordifyUrl(track.title, track.artist),
          addedBy: body.addedBy || null,
        })
        .returning();

      addedSongs.push(result[0]);
    }

    return NextResponse.json(
      {
        playlistName: info.name,
        added: addedSongs.length,
        skipped,
        total: tracks.length,
        songs: addedSongs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing Spotify playlist:", error);

    const message =
      error instanceof Error ? error.message : "Failed to sync playlist";

    // Return a user-friendly error for known issues
    if (message.includes("SPOTIFY_CLIENT_ID")) {
      return NextResponse.json(
        { error: "Spotify integration is not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET." },
        { status: 503 }
      );
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
