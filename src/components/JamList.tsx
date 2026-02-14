'use client';

import React, { useState, useMemo } from 'react';
import { SongCard } from './SongCard';

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

interface JamListProps {
  songs: Song[];
  isLoading?: boolean;
}

type FilterType = 'all' | SongStatus;
type SortType = 'createdAt' | 'artist' | 'title' | 'status';

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'want_to_jam', label: 'Want to Jam' },
  { value: 'learning', label: 'Learning' },
  { value: 'can_play', label: 'Can Play' },
  { value: 'nailed_it', label: 'Nailed It' },
];

const SORT_OPTIONS: { value: SortType; label: string }[] = [
  { value: 'createdAt', label: 'Recently Added' },
  { value: 'artist', label: 'Artist' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
];

const STATUS_ORDER: Record<SongStatus, number> = {
  want_to_jam: 0,
  learning: 1,
  can_play: 2,
  nailed_it: 3,
};

export function JamList({ songs, isLoading = false }: JamListProps) {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('createdAt');

  const filteredAndSortedSongs = useMemo(() => {
    let result = [...songs];

    // Apply filter
    if (filter !== 'all') {
      result = result.filter((song) => song.status === filter);
    }

    // Apply sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'artist':
          return a.artist.localeCompare(b.artist);
        case 'title':
          return a.title.localeCompare(b.title);
        case 'status':
          return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [songs, filter, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[var(--color-primary)] border-t-transparent"></div>
          <p className="mt-4 text-[var(--color-text-muted)]">Loading your jam list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filter & Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-[var(--color-surface)] p-4 rounded-lg">
        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-all ${
                filter === option.value
                  ? 'bg-[var(--color-primary)] text-white shadow-lg'
                  : 'bg-zinc-800 text-[var(--color-text-muted)] hover:bg-zinc-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-text-muted)] font-semibold">
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortType)}
            className="bg-zinc-800 text-[var(--color-foreground)] px-3 py-1.5 rounded-md text-sm font-semibold border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Song Grid */}
      {filteredAndSortedSongs.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🎸</div>
          <h3 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
            No songs found
          </h3>
          <p className="text-[var(--color-text-muted)]">
            {filter === 'all'
              ? 'Add your first song to get started!'
              : `No songs match the "${FILTER_OPTIONS.find((o) => o.value === filter)?.label}" filter.`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAndSortedSongs.map((song) => (
            <SongCard key={song.id} song={song} />
          ))}
        </div>
      )}
    </div>
  );
}
