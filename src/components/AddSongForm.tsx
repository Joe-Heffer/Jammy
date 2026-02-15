'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Input } from '@/components/ui';

type SongStatus = 'want_to_jam' | 'learning' | 'can_play' | 'nailed_it';
type Difficulty = 'easy' | 'medium' | 'hard';

interface FormData {
  title: string;
  artist: string;
  album: string;
  status: SongStatus;
  bassDifficulty: Difficulty | '';
  drumsDifficulty: Difficulty | '';
  spotifyUrl: string;
  youtubeUrl: string;
  songsterrUrl: string;
  geniusUrl: string;
  chordChartUrl: string;
  notes: string;
  addedBy: string;
}

const initialFormData: FormData = {
  title: '',
  artist: '',
  album: '',
  status: 'want_to_jam',
  bassDifficulty: '',
  drumsDifficulty: '',
  spotifyUrl: '',
  youtubeUrl: '',
  songsterrUrl: '',
  geniusUrl: '',
  chordChartUrl: '',
  notes: '',
  addedBy: '',
};

const statusOptions = [
  { value: 'want_to_jam', label: 'Want to Jam' },
  { value: 'learning', label: 'Learning' },
  { value: 'can_play', label: 'Can Play' },
  { value: 'nailed_it', label: 'Nailed It' },
];

const difficultyOptions = [
  { value: '', label: 'Not set' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

export function AddSongForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.artist.trim()) {
      newErrors.artist = 'Artist is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const body: Record<string, string> = {
        title: formData.title.trim(),
        artist: formData.artist.trim(),
        status: formData.status,
      };

      if (formData.album.trim()) body.album = formData.album.trim();
      if (formData.bassDifficulty) body.bassDifficulty = formData.bassDifficulty;
      if (formData.drumsDifficulty) body.drumsDifficulty = formData.drumsDifficulty;
      if (formData.spotifyUrl.trim()) body.spotifyUrl = formData.spotifyUrl.trim();
      if (formData.youtubeUrl.trim()) body.youtubeUrl = formData.youtubeUrl.trim();
      if (formData.songsterrUrl.trim()) body.songsterrUrl = formData.songsterrUrl.trim();
      if (formData.geniusUrl.trim()) body.geniusUrl = formData.geniusUrl.trim();
      if (formData.chordChartUrl.trim()) body.chordChartUrl = formData.chordChartUrl.trim();
      if (formData.notes.trim()) body.notes = formData.notes.trim();
      if (formData.addedBy.trim()) body.addedBy = formData.addedBy.trim();

      const response = await fetch('/api/songs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add song');
      }

      router.push('/jam');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {submitError && (
        <div className="bg-red-900/20 border border-red-900 rounded-lg p-4">
          <p className="text-red-400 text-sm font-medium">{submitError}</p>
        </div>
      )}

      {/* Required Fields */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-[var(--color-foreground)] mb-2">
          Song Details
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Title *"
            name="title"
            placeholder="Enter song title"
            value={formData.title}
            onChange={handleChange}
            error={errors.title}
          />
          <Input
            label="Artist *"
            name="artist"
            placeholder="Enter artist name"
            value={formData.artist}
            onChange={handleChange}
            error={errors.artist}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Album"
            name="album"
            placeholder="Album name"
            value={formData.album}
            onChange={handleChange}
          />
          <Input
            variant="select"
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={statusOptions}
          />
          <Input
            label="Added By"
            name="addedBy"
            placeholder="Your name"
            value={formData.addedBy}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      {/* Difficulty */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-[var(--color-foreground)] mb-2">
          Difficulty
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            variant="select"
            label="Bass Difficulty"
            name="bassDifficulty"
            value={formData.bassDifficulty}
            onChange={handleChange}
            options={difficultyOptions}
          />
          <Input
            variant="select"
            label="Drums Difficulty"
            name="drumsDifficulty"
            value={formData.drumsDifficulty}
            onChange={handleChange}
            options={difficultyOptions}
          />
        </div>
      </fieldset>

      {/* Links */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-[var(--color-foreground)] mb-2">
          Links
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Spotify URL"
            name="spotifyUrl"
            type="url"
            placeholder="https://open.spotify.com/..."
            value={formData.spotifyUrl}
            onChange={handleChange}
          />
          <Input
            label="YouTube URL"
            name="youtubeUrl"
            type="url"
            placeholder="https://youtube.com/..."
            value={formData.youtubeUrl}
            onChange={handleChange}
          />
          <Input
            label="Songsterr URL"
            name="songsterrUrl"
            type="url"
            placeholder="https://songsterr.com/..."
            value={formData.songsterrUrl}
            onChange={handleChange}
          />
          <Input
            label="Genius URL"
            name="geniusUrl"
            type="url"
            placeholder="https://genius.com/..."
            value={formData.geniusUrl}
            onChange={handleChange}
          />
          <Input
            label="Chord Chart URL"
            name="chordChartUrl"
            type="url"
            placeholder="https://..."
            value={formData.chordChartUrl}
            onChange={handleChange}
            helperText="Link to a chord chart (Ultimate Guitar, Chordify, etc.)"
          />
        </div>
      </fieldset>

      {/* Notes */}
      <fieldset className="space-y-4">
        <legend className="text-lg font-bold text-[var(--color-foreground)] mb-2">
          Notes
        </legend>
        <Input
          variant="textarea"
          label="Notes"
          name="notes"
          placeholder="Any notes about this song..."
          value={formData.notes}
          onChange={handleChange}
        />
      </fieldset>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t border-[var(--color-border)]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.push('/jam')}
          disabled={isSubmitting}
          className="rounded-lg"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          loading={isSubmitting}
          className="rounded-lg"
        >
          {isSubmitting ? 'Adding...' : 'Add Song'}
        </Button>
      </div>
    </form>
  );
}
