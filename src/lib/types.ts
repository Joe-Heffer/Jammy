import type { Song as DbSong } from "@/lib/db/schema";

/**
 * Shared client-side types derived from the Drizzle schema.
 *
 * JSON serialization turns Date objects into strings, so this type
 * represents a song as returned by the API.
 */
export type Song = Omit<DbSong, "createdAt" | "updatedAt"> & {
  createdAt: string;
  updatedAt: string;
};

export type SongStatus = Song["status"];

export type Difficulty = NonNullable<Song["bassDifficulty"]>;
