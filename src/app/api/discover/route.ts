import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { songs } from "@/lib/db/schema";
import { getRecommendations } from "@/lib/lastfm";

/**
 * GET /api/discover
 *
 * Returns song recommendations based on the unique artists in the jam list.
 * Uses Last.fm's similar tracks and similar artists APIs.
 *
 * Returns: { recommendations: Record<string, Recommendation[]> }
 * Each key is an artist name from the jam list, value is an array of recommended tracks.
 */
export async function GET() {
  try {
    const apiKey = process.env.LASTFM_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Last.fm API key is not configured. Set LASTFM_API_KEY to enable recommendations." },
        { status: 503 }
      );
    }

    // Fetch all songs to get unique artists and existing song keys
    const allSongs = await db.select().from(songs);

    if (allSongs.length === 0) {
      return NextResponse.json({
        recommendations: {},
        message: "Add some songs to your jam list first to get recommendations!",
      });
    }

    // Get unique artists (preserve original casing of first occurrence)
    const artistMap = new Map<string, string>();
    for (const song of allSongs) {
      const key = song.artist.toLowerCase();
      if (!artistMap.has(key)) {
        artistMap.set(key, song.artist);
      }
    }
    const uniqueArtists = Array.from(artistMap.values());

    // Build a set of existing song keys for deduplication
    const existingKeys = new Set(
      allSongs.map((s) => `${s.title.toLowerCase()}|${s.artist.toLowerCase()}`)
    );

    const recommendations = await getRecommendations(
      uniqueArtists,
      existingKeys,
      6
    );

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommendations" },
      { status: 500 }
    );
  }
}
