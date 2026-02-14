import Link from 'next/link';
import { AddSongForm } from '@/components/AddSongForm';

export default function AddSongPage() {
  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      {/* Header */}
      <header className="bg-[var(--color-surface)] border-b border-zinc-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/jam"
              className="text-[var(--color-muted)] hover:text-[var(--color-foreground)] transition-colors"
            >
              &larr; Back
            </Link>
            <div>
              <h1 className="text-3xl font-black text-[var(--color-foreground)] tracking-tight">
                Add Song
              </h1>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Add a new song to the jam list
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6">
          <AddSongForm />
        </div>
      </main>
    </div>
  );
}
