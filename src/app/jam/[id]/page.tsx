import Link from 'next/link';
import { SongDetail } from '@/components/SongDetail';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function SongDetailPage({ params }: PageProps) {
  const { id } = await params;

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
                Song Details
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <SongDetail songId={id} />
      </main>
    </div>
  );
}
