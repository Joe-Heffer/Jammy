CREATE TABLE "songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"artist" text NOT NULL,
	"album" text,
	"status" text DEFAULT 'want_to_jam' NOT NULL,
	"bass_difficulty" text,
	"drums_difficulty" text,
	"spotify_id" text,
	"spotify_url" text,
	"youtube_url" text,
	"cover_art_url" text,
	"songsterr_url" text,
	"songsterr_bass_id" integer,
	"songsterr_drum_id" integer,
	"genius_url" text,
	"notes" text,
	"added_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "artist_idx" ON "songs" USING btree ("artist");--> statement-breakpoint
CREATE INDEX "status_idx" ON "songs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "created_at_idx" ON "songs" USING btree ("created_at");