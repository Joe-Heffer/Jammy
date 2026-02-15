'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface SyncResult {
  playlistName: string;
  added: number;
  skipped: number;
  total: number;
}

interface SpotifySyncProps {
  onSynced: () => void;
  onClose: () => void;
}

export function SpotifySync({ onSynced, onClose }: SpotifySyncProps) {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SyncResult | null>(null);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playlistUrl.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/spotify/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playlistUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to sync playlist');
      }

      setResult(data);
      if (data.added > 0) {
        onSynced();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl w-full max-w-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-[#1DB954]" fill="currentColor">
              <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
            </svg>
            <h2 className="text-lg font-bold text-[var(--color-foreground)]">
              Sync Spotify Playlist
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {!result ? (
            <form onSubmit={handleSync}>
              <Input
                label="Playlist URL"
                placeholder="https://open.spotify.com/playlist/..."
                value={playlistUrl}
                onChange={(e) => setPlaylistUrl((e.target as HTMLInputElement).value)}
                helperText="Paste a link to a public Spotify playlist"
                disabled={loading}
              />

              {error && (
                <div className="mt-4 bg-red-900/20 border border-red-900 rounded-lg px-4 py-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={loading}
                  disabled={!playlistUrl.trim()}
                >
                  {loading ? 'Syncing...' : 'Sync Playlist'}
                </Button>
              </div>
            </form>
          ) : (
            <div>
              <div className="text-center mb-4">
                <p className="text-[var(--color-foreground)] font-semibold text-lg">
                  {result.playlistName}
                </p>
                <p className="text-[var(--color-muted)] text-sm mt-1">
                  {result.total} tracks in playlist
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 my-5">
                <div className="bg-green-900/20 border border-green-900/50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-green-400">{result.added}</p>
                  <p className="text-sm text-green-400/80">Added</p>
                </div>
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-[var(--color-muted)]">{result.skipped}</p>
                  <p className="text-sm text-[var(--color-subtle)]">Already existed</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button variant="primary" onClick={onClose}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
