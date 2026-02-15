import { pgTable, text, integer, uuid, timestamp, index } from "drizzle-orm/pg-core";

/**
 * Songs table — the core of Jammy.
 *
 * Uses PostgreSQL (Neon) for both local development and production.
 * Vercel Postgres has migrated to Neon as a native integration.
 * Schema uses PostgreSQL-native types (UUID, timestamps with timezone, indexes).
 */
export const songs = pgTable("songs", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),
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
  chordChartUrl: text("chord_chart_url"),

  // Metadata
  notes: text("notes"),
  addedBy: text("added_by"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
}, (table) => ({
  // PostgreSQL indexes for common queries
  artistIdx: index("artist_idx").on(table.artist),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("created_at_idx").on(table.createdAt),
}));

// Type exports for use across the app
export type Song = typeof songs.$inferSelect;
export type NewSong = typeof songs.$inferInsert;
