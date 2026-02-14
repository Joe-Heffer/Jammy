import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { songs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/songs/[id]
 * Return single song by ID
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    const result = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result[0], {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error fetching song:", error);
    return NextResponse.json(
      { error: "Failed to fetch song" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/songs/[id]
 * Update song fields
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

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

    // Validate difficulty levels if provided
    if (body.bassDifficulty || body.drumsDifficulty) {
      const validDifficulties = ["easy", "medium", "hard"];
      if (body.bassDifficulty && !validDifficulties.includes(body.bassDifficulty)) {
        return NextResponse.json(
          { error: "Invalid bassDifficulty value. Must be one of: easy, medium, hard" },
          { status: 400 }
        );
      }
      if (body.drumsDifficulty && !validDifficulties.includes(body.drumsDifficulty)) {
        return NextResponse.json(
          { error: "Invalid drumsDifficulty value. Must be one of: easy, medium, hard" },
          { status: 400 }
        );
      }
    }

    // Prepare update data - only allow specific fields to be updated
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    // Allowed fields for update
    const allowedFields = [
      "status",
      "notes",
      "bassDifficulty",
      "drumsDifficulty",
      "spotifyId",
      "spotifyUrl",
      "youtubeUrl",
      "coverArtUrl",
      "songsterrUrl",
      "songsterrBassId",
      "songsterrDrumId",
      "geniusUrl",
    ] as const;

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field];
      }
    }

    // Check if song exists
    const existingSong = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    if (existingSong.length === 0) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    // Update the song
    const result = await db
      .update(songs)
      .set(updateData)
      .where(eq(songs.id, id))
      .returning();

    return NextResponse.json(result[0], {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error updating song:", error);
    return NextResponse.json(
      { error: "Failed to update song" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/songs/[id]
 * Delete song by ID
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = await context.params;

    // Check if song exists
    const existingSong = await db
      .select()
      .from(songs)
      .where(eq(songs.id, id))
      .limit(1);

    if (existingSong.length === 0) {
      return NextResponse.json(
        { error: "Song not found" },
        { status: 404 }
      );
    }

    // Delete the song
    await db.delete(songs).where(eq(songs.id, id));

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting song:", error);
    return NextResponse.json(
      { error: "Failed to delete song" },
      { status: 500 }
    );
  }
}
