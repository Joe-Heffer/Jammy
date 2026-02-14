'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { JamList } from '@/components/JamList';

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
  createdAt: string;
}

export default function JamDashboard() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch('/api/songs');

        if (!response.ok) {
          throw new Error(`Failed to fetch songs: ${response.statusText}`);
        }

        const data = await response.json();
        setSongs(data.songs || []);
      } catch (err) {
        console.error('Error fetching songs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load songs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongs();
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[var(--color-foreground)] tracking-tight">
                🎸 Jam List
              </h1>
              <p className="text-sm text-[var(--color-text-muted)] mt-1">
                Track your bass & drum journey
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/jam/add"
                className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl"
              >
                + Add Song
              </Link>
              <Link
                href="/jam/discover"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all"
              >
                🔍 Discover
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {error ? (
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-6 text-center">
            <p className="text-red-400 font-semibold">⚠️ {error}</p>
          </div>
        ) : (
          <JamList songs={songs} isLoading={isLoading} />
        )}
      </main>
    </div>
  );
}
