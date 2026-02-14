import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

/**
 * Songs table — the core of Jammy.
 *
 * Local dev uses SQLite (better-sqlite3).
 * Production will use Neon Postgres (schema migrated to pg-core).
 * See ARCHITECTURE.md roadmap for the migration plan.
 */
export const songs = sqliteTable("songs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  album: text("album"),

  // Status tracking
  status: text("status", {
    enum: ["want_to_jam", "learning", "can_play", "nailed_it"],
  })
    .notNull()
    .default("want_to_jam"),
  bassDifficulty: text("bass_difficulty", {
    enum: ["easy", "medium", "hard"],
  }),
  drumsDifficulty: text("drums_difficulty", {
    enum: ["easy", "medium", "hard"],
  }),

  // Platform links
  spotifyId: text("spotify_id"),
  spotifyUrl: text("spotify_url"),
  youtubeUrl: text("youtube_url"),
  coverArtUrl: text("cover_art_url"),

  // Resource links (populated on add or lazily)
  songsterrUrl: text("songsterr_url"),
  songsterrBassId: integer("songsterr_bass_id"),
  songsterrDrumId: integer("songsterr_drum_id"),
  geniusUrl: text("genius_url"),

  // Metadata
  notes: text("notes"),
  addedBy: text("added_by"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(datetime('now'))`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(datetime('now'))`),
});

// Type exports for use across the app
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
