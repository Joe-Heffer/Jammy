'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { RecommendationCard } from '@/components/RecommendationCard';

interface Recommendation {
  title: string;
  artist: string;
  imageUrl: string | null;
  lastfmUrl: string | null;
  seedArtist: string;
  match: number;
}

export default function DiscoverPage() {
  const [recommendations, setRecommendations] = useState<Record<string, Recommendation[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const fetchRecommendations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch('/api/discover');

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || {});
      if (data.message) {
        setMessage(data.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  async function handleAddSong(rec: Recommendation) {
    const response = await fetch('/api/songs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: rec.title,
        artist: rec.artist,
        status: 'want_to_jam',
      }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to add song');
    }
  }

  const artistGroups = Object.entries(recommendations);
  const hasRecommendations = artistGroups.length > 0;

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-[var(--color-foreground)] tracking-tight">
                Discover
              </h1>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                New tracks to jam based on your list
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/jam"
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all"
              >
                &larr; Jam List
              </Link>
              <button
                onClick={fetchRecommendations}
                disabled={isLoading}
                className="px-4 py-2 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                {isLoading ? 'Loading...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-900 rounded-lg p-6 text-center">
            <p className="text-red-400 font-semibold">{error}</p>
            {error.includes('API key') && (
              <p className="text-[var(--color-muted)] text-sm mt-2">
                Add your Last.fm API key to the LASTFM_API_KEY environment variable to enable recommendations.
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin" />
            <p className="text-[var(--color-muted)] text-sm">
              Finding tracks you might like...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && !hasRecommendations && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">&#127925;</div>
            <h2 className="text-xl font-bold text-[var(--color-foreground)] mb-2">
              {message || 'No recommendations yet'}
            </h2>
            <p className="text-[var(--color-muted)] mb-6">
              Add some songs to your jam list and come back for personalized suggestions.
            </p>
            <Link
              href="/jam/add"
              className="inline-block px-6 py-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white font-bold rounded-lg transition-all"
            >
              + Add a Song
            </Link>
          </div>
        )}

        {/* Recommendations by Artist */}
        {!isLoading && hasRecommendations && (
          <div className="space-y-10">
            {artistGroups.map(([seedArtist, recs]) => (
              <section key={seedArtist}>
                <h2 className="text-lg font-bold text-[var(--color-foreground)] mb-4">
                  Because you like{' '}
                  <span className="text-[var(--color-primary)]">{seedArtist}</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {recs.map((rec) => (
                    <RecommendationCard
                      key={`${rec.title}-${rec.artist}`}
                      recommendation={rec}
                      onAdd={handleAddSong}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
