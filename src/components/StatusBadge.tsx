import React from 'react';
import type { SongStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: SongStatus;
  className?: string;
}

const STATUS_CONFIG = {
  want_to_jam: {
    label: 'Want to Jam',
    bgColor: 'bg-[var(--color-status-want)]',
    textColor: 'text-white',
    icon: (
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
    ),
  },
  learning: {
    label: 'Learning',
    bgColor: 'bg-[var(--color-status-learning)]',
    textColor: 'text-white',
    icon: (
      <span className="relative flex h-2 w-2">
        <span className="inline-flex rounded-full h-2 w-2 bg-white"></span>
      </span>
    ),
  },
  can_play: {
    label: 'Can Play',
    bgColor: 'bg-[var(--color-status-can-play)]',
    textColor: 'text-white',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      </svg>
    ),
  },
  nailed_it: {
    label: 'Nailed It',
    bgColor: 'bg-[var(--color-status-nailed)]',
    textColor: 'text-white',
    icon: (
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
      </svg>
    ),
  },
};

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold ${config.bgColor} ${config.textColor} ${className}`}
    >
      {config.icon}
      <span>{config.label}</span>
    </div>
  );
}
