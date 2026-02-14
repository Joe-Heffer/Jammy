'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Recommendation {
  title: string;
  artist: string;
  imageUrl: string | null;
  lastfmUrl: string | null;
  seedArtist: string;
  match: number;
}

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAdd: (rec: Recommendation) => Promise<void>;
}

export function RecommendationCard({ recommendation, onAdd }: RecommendationCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  async function handleAdd() {
    setIsAdding(true);
    try {
      await onAdd(recommendation);
      setIsAdded(true);
    } catch {
      setIsAdding(false);
    }
  }

  return (
    <div className="bg-[var(--color-surface)] rounded-lg overflow-hidden border border-transparent hover:border-[var(--color-primary)] hover:shadow-[0_0_20px_rgba(220,38,38,0.2)] transition-all duration-150">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-zinc-900">
        {recommendation.imageUrl ? (
          <Image
            src={recommendation.imageUrl}
            alt={`${recommendation.title} by ${recommendation.artist}`}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-3 space-y-2">
        <div>
          <h4 className="text-sm font-bold text-[var(--color-foreground)] line-clamp-1">
            {recommendation.title}
          </h4>
          <p className="text-xs text-[var(--color-muted)] line-clamp-1">
            {recommendation.artist}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {recommendation.lastfmUrl && (
            <a
              href={recommendation.lastfmUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-2 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded text-xs font-semibold text-center transition-colors"
            >
              Preview
            </a>
          )}
          <button
            onClick={handleAdd}
            disabled={isAdding || isAdded}
            className={`flex-1 px-2 py-1.5 rounded text-xs font-semibold transition-colors ${
              isAdded
                ? 'bg-[var(--color-status-nailed)] text-black cursor-default'
                : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white'
            } disabled:opacity-60`}
          >
            {isAdded ? 'Added!' : isAdding ? 'Adding...' : '+ Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
