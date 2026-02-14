'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { StatusBadge } from './StatusBadge';

type SongStatus = 'want_to_jam' | 'learning' | 'can_play' | 'nailed_it';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Song {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  status: SongStatus;
  bassDifficulty: Difficulty | null;
  drumsDifficulty: Difficulty | null;
  coverArtUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  songsterrUrl: string | null;
  geniusUrl: string | null;
}

interface SongCardProps {
  song: Song;
}

const DIFFICULTY_DISPLAY: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export function SongCard({ song }: SongCardProps) {
  const handleQuickAction = (e: React.MouseEvent, url: string | null) => {
    if (!url) {
      e.preventDefault();
      return;
    }
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Link href={`/jam/${song.id}`} className="block group">
      <div className="bg-[var(--color-surface)] rounded-lg overflow-hidden transition-all duration-150 hover:bg-[#262626] hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] border border-transparent hover:border-[var(--color-primary)]">
        {/* Album Art */}
        <div className="relative aspect-square overflow-hidden bg-zinc-900">
          {song.coverArtUrl ? (
            <Image
              src={song.coverArtUrl}
              alt={`${song.title} cover art`}
              fill
              className="object-cover"
              style={{
                background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.3) 100%)',
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-600">
              <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
            </div>
          )}
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30 pointer-events-none" />
        </div>

        {/* Card Content */}
        <div className="p-4 space-y-3">
          {/* Title & Artist */}
          <div>
            <h3 className="text-lg font-bold text-[var(--color-foreground)] line-clamp-1 group-hover:text-[var(--color-primary)] transition-colors">
              {song.title}
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] line-clamp-1">
              {song.artist}
            </p>
            {song.album && (
              <p className="text-xs text-[var(--color-text-subtle)] line-clamp-1">
                {song.album}
              </p>
            )}
          </div>

          {/* Status Badge */}
          <div>
            <StatusBadge status={song.status} />
          </div>

          {/* Difficulty */}
          {(song.bassDifficulty || song.drumsDifficulty) && (
            <div className="flex gap-2 text-xs text-[var(--color-text-muted)]">
              {song.bassDifficulty && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Bass:</span>
                  <span>{DIFFICULTY_DISPLAY[song.bassDifficulty]}</span>
                </div>
              )}
              {song.drumsDifficulty && (
                <div className="flex items-center gap-1">
                  <span className="font-semibold">Drums:</span>
                  <span>{DIFFICULTY_DISPLAY[song.drumsDifficulty]}</span>
                </div>
              )}
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2">
            {song.spotifyUrl && (
              <button
                onClick={(e) => handleQuickAction(e, song.spotifyUrl)}
                className="flex-1 px-2 py-1.5 bg-zinc-800 hover:bg-[#1DB954] rounded text-xs font-semibold transition-colors"
                title="Open in Spotify"
              >
                Spotify
              </button>
            )}
            {song.youtubeUrl && (
              <button
                onClick={(e) => handleQuickAction(e, song.youtubeUrl)}
                className="flex-1 px-2 py-1.5 bg-zinc-800 hover:bg-[#FF0000] rounded text-xs font-semibold transition-colors"
                title="Open in YouTube"
              >
                YouTube
              </button>
            )}
            {song.songsterrUrl && (
              <button
                onClick={(e) => handleQuickAction(e, song.songsterrUrl)}
                className="flex-1 px-2 py-1.5 bg-zinc-800 hover:bg-[var(--color-accent)] rounded text-xs font-semibold transition-colors"
                title="View tabs on Songsterr"
              >
                Tabs
              </button>
            )}
            {song.geniusUrl && (
              <button
                onClick={(e) => handleQuickAction(e, song.geniusUrl)}
                className="flex-1 px-2 py-1.5 bg-zinc-800 hover:bg-[var(--color-accent)] rounded text-xs font-semibold transition-colors"
                title="View lyrics on Genius"
              >
                Lyrics
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
