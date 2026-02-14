'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';
import { Button, Input } from '@/components/ui';

type SongStatus = 'want_to_jam' | 'learning' | 'can_play' | 'nailed_it';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Song {
  id: string;
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
  songsterrBassId: number | null;
  songsterrDrumId: number | null;
  geniusUrl: string | null;
  notes: string | null;
  addedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SongDetailProps {
  songId: string;
}

const STATUS_OPTIONS: { value: SongStatus; label: string }[] = [
  { value: 'want_to_jam', label: 'Want to Jam' },
  { value: 'learning', label: 'Learning' },
  { value: 'can_play', label: 'Can Play' },
  { value: 'nailed_it', label: 'Nailed It' },
];

const DIFFICULTY_OPTIONS: { value: Difficulty | ''; label: string }[] = [
  { value: '', label: 'Not set' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const DIFFICULTY_DISPLAY: Record<Difficulty, { label: string; color: string }> = {
  easy: { label: 'Easy', color: 'text-green-400' },
  medium: { label: 'Medium', color: 'text-amber-400' },
  hard: { label: 'Hard', color: 'text-red-400' },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function SongDetail({ songId }: SongDetailProps) {
  const router = useRouter();
  const [song, setSong] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editStatus, setEditStatus] = useState<SongStatus>('want_to_jam');
  const [editBassDifficulty, setEditBassDifficulty] = useState<Difficulty | ''>('');
  const [editDrumsDifficulty, setEditDrumsDifficulty] = useState<Difficulty | ''>('');
  const [editNotes, setEditNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSong = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/songs/${songId}`);

      if (response.status === 404) {
        setError('Song not found');
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch song: ${response.statusText}`);
      }

      const data = await response.json();
      setSong(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load song');
    } finally {
      setIsLoading(false);
    }
  }, [songId]);

  useEffect(() => {
    fetchSong();
  }, [fetchSong]);

  function startEditing() {
    if (!song) return;
    setEditStatus(song.status);
    setEditBassDifficulty(song.bassDifficulty ?? '');
    setEditDrumsDifficulty(song.drumsDifficulty ?? '');
    setEditNotes(song.notes ?? '');
    setSaveError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setSaveError(null);
  }

  async function handleSave() {
    setIsSaving(true);
    setSaveError(null);

    try {
      const body: Record<string, unknown> = {
        status: editStatus,
        notes: editNotes || null,
        bassDifficulty: editBassDifficulty || null,
        drumsDifficulty: editDrumsDifficulty || null,
      };

      const response = await fetch(`/api/songs/${songId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save changes');
      }

      const updated = await response.json();
      setSong(updated);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);

    try {
      const response = await fetch(`/api/songs/${songId}`, {
        method: 'DELETE',
      });

      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete song');
      }

      router.push('/jam');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-4">
          <svg
            className="animate-spin h-8 w-8 text-[var(--color-primary)]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-[var(--color-text-muted)]">Loading song...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !song) {
    return (
      <div className="bg-red-900/20 border border-red-900 rounded-lg p-6 text-center">
        <p className="text-red-400 font-semibold mb-4">{error || 'Song not found'}</p>
        <Link
          href="/jam"
          className="text-[var(--color-text-muted)] hover:text-[var(--color-foreground)] transition-colors"
        >
          &larr; Back to Jam List
        </Link>
      </div>
    );
  }

  const externalLinks = [
    { url: song.spotifyUrl, label: 'Spotify', hoverColor: 'hover:bg-[#1DB954]' },
    { url: song.youtubeUrl, label: 'YouTube', hoverColor: 'hover:bg-[#FF0000]' },
    { url: song.songsterrUrl, label: 'Tabs', hoverColor: 'hover:bg-[var(--color-accent)]' },
    { url: song.geniusUrl, label: 'Lyrics', hoverColor: 'hover:bg-[var(--color-accent)]' },
  ].filter((link) => link.url);

  return (
    <div className="space-y-6">
      {/* Song Header */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl overflow-hidden">
        <div className="flex flex-col sm:flex-row">
          {/* Cover Art */}
          <div className="relative w-full sm:w-64 md:w-80 aspect-square sm:aspect-auto sm:min-h-64 flex-shrink-0 bg-zinc-900">
            {song.coverArtUrl ? (
              <Image
                src={song.coverArtUrl}
                alt={`${song.title} cover art`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 320px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600 min-h-48">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                </svg>
              </div>
            )}
          </div>

          {/* Song Info */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div className="space-y-3">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-[var(--color-foreground)] tracking-tight">
                  {song.title}
                </h2>
                <p className="text-lg text-[var(--color-text-muted)] mt-1">{song.artist}</p>
                {song.album && (
                  <p className="text-sm text-[var(--color-text-subtle)] mt-0.5">{song.album}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <StatusBadge status={song.status} />

                {song.bassDifficulty && (
                  <span className="text-xs font-mono">
                    <span className="text-[var(--color-text-subtle)]">Bass:</span>{' '}
                    <span className={DIFFICULTY_DISPLAY[song.bassDifficulty].color}>
                      {DIFFICULTY_DISPLAY[song.bassDifficulty].label}
                    </span>
                  </span>
                )}
                {song.drumsDifficulty && (
                  <span className="text-xs font-mono">
                    <span className="text-[var(--color-text-subtle)]">Drums:</span>{' '}
                    <span className={DIFFICULTY_DISPLAY[song.drumsDifficulty].color}>
                      {DIFFICULTY_DISPLAY[song.drumsDifficulty].label}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* External Links */}
            {externalLinks.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {externalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.url!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-4 py-2 bg-zinc-800 ${link.hoverColor} rounded-lg text-sm font-semibold transition-colors`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notes / Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Edit Mode */}
          {isEditing ? (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-6">
              <h3 className="text-lg font-bold text-[var(--color-foreground)]">Edit Song</h3>

              {saveError && (
                <div className="bg-red-900/20 border border-red-900 rounded-lg p-4">
                  <p className="text-red-400 text-sm font-medium">{saveError}</p>
                </div>
              )}

              <Input
                variant="select"
                label="Status"
                name="status"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as SongStatus)}
                options={STATUS_OPTIONS}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  variant="select"
                  label="Bass Difficulty"
                  name="bassDifficulty"
                  value={editBassDifficulty}
                  onChange={(e) => setEditBassDifficulty(e.target.value as Difficulty | '')}
                  options={DIFFICULTY_OPTIONS}
                />
                <Input
                  variant="select"
                  label="Drums Difficulty"
                  name="drumsDifficulty"
                  value={editDrumsDifficulty}
                  onChange={(e) => setEditDrumsDifficulty(e.target.value as Difficulty | '')}
                  options={DIFFICULTY_OPTIONS}
                />
              </div>

              <Input
                variant="textarea"
                label="Notes"
                name="notes"
                placeholder="Any notes about this song..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
              />

              <div className="flex gap-3 justify-end pt-2 border-t border-[var(--color-border)]">
                <Button
                  variant="secondary"
                  onClick={cancelEditing}
                  disabled={isSaving}
                  className="rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={isSaving}
                  className="rounded-lg"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Notes Display */}
              <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
                <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-3">Notes</h3>
                {song.notes ? (
                  <p className="text-[var(--color-text-muted)] whitespace-pre-wrap">{song.notes}</p>
                ) : (
                  <p className="text-[var(--color-text-subtle)] italic">No notes yet</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          {!isEditing && (
            <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 space-y-3">
              <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-1">Actions</h3>
              <Button
                variant="secondary"
                onClick={startEditing}
                className="w-full rounded-lg"
              >
                Edit Song
              </Button>
              {showDeleteConfirm ? (
                <div className="space-y-2">
                  <p className="text-sm text-red-400 text-center">Are you sure?</p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="small"
                      onClick={() => setShowDeleteConfirm(false)}
                      disabled={isDeleting}
                      className="flex-1 rounded-lg"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="danger"
                      size="small"
                      onClick={handleDelete}
                      loading={isDeleting}
                      className="flex-1 rounded-lg"
                    >
                      {isDeleting ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="danger"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full rounded-lg"
                >
                  Delete Song
                </Button>
              )}
            </div>
          )}

          {/* Metadata */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
            <h3 className="text-lg font-bold text-[var(--color-foreground)] mb-3">Details</h3>
            <dl className="space-y-3 text-sm">
              {song.addedBy && (
                <div>
                  <dt className="text-[var(--color-text-subtle)]">Added by</dt>
                  <dd className="text-[var(--color-foreground)] font-medium">{song.addedBy}</dd>
                </div>
              )}
              <div>
                <dt className="text-[var(--color-text-subtle)]">Added</dt>
                <dd className="text-[var(--color-foreground)] font-medium">
                  {formatDate(song.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-[var(--color-text-subtle)]">Last updated</dt>
                <dd className="text-[var(--color-foreground)] font-medium">
                  {formatDate(song.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
