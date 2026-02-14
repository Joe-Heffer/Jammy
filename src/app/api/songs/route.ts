import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { songs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

/**
 * GET /api/songs
 * List all songs with optional filtering and sorting
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const sortBy = searchParams.get("sortBy") || "createdAt";

    let query = db.select().from(songs);

    // Filter by status if provided
    if (status) {
      const validStatuses = ["want_to_jam", "learning", "can_play", "nailed_it"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: "Invalid status value" },
          { status: 400 }
        );
      }
      query = query.where(eq(songs.status, status as "want_to_jam" | "learning" | "can_play" | "nailed_it"));
    }

    // Apply sorting
    let orderColumn;
    switch (sortBy) {
      case "artist":
        orderColumn = songs.artist;
        break;
      case "title":
        orderColumn = songs.title;
        break;
      case "createdAt":
      default:
        orderColumn = songs.createdAt;
        break;
    }

    const allSongs = await query.orderBy(desc(orderColumn));

    return NextResponse.json(allSongs, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching songs:", error);
    return NextResponse.json(
      { error: "Failed to fetch songs" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/songs
 * Create a new song
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.title || !body.artist) {
      return NextResponse.json(
        { error: "Missing required fields: title and artist are required" },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ["want_to_jam", "learning", "can_play", "nailed_it"];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { error: "Invalid status value. Must be one of: want_to_jam, learning, can_play, nailed_it" },
          { status: 400 }
        );
      }
    }

    // Prepare song data
    const newSong = {
      title: body.title,
      artist: body.artist,
      album: body.album || null,
      status: body.status || "want_to_jam",
      bassDifficulty: body.bassDifficulty || null,
      drumsDifficulty: body.drumsDifficulty || null,
      spotifyId: body.spotifyId || null,
      spotifyUrl: body.spotifyUrl || null,
      youtubeUrl: body.youtubeUrl || null,
      coverArtUrl: body.coverArtUrl || null,
      songsterrUrl: body.songsterrUrl || null,
      songsterrBassId: body.songsterrBassId || null,
      songsterrDrumId: body.songsterrDrumId || null,
      geniusUrl: body.geniusUrl || null,
      notes: body.notes || null,
      addedBy: body.addedBy || null,
    };

    // Insert song
    const result = await db.insert(songs).values(newSong).returning();

    return NextResponse.json(result[0], {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error creating song:", error);
    return NextResponse.json(
      { error: "Failed to create song" },
      { status: 500 }
    );
  }
}
