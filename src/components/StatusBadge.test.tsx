import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge } from './StatusBadge';

describe('StatusBadge', () => {
  it('renders "Want to Jam" status correctly', () => {
    render(<StatusBadge status="want_to_jam" />);
    expect(screen.getByText('Want to Jam')).toBeInTheDocument();
  });

  it('renders "Learning" status correctly', () => {
    render(<StatusBadge status="learning" />);
    expect(screen.getByText('Learning')).toBeInTheDocument();
  });

  it('renders "Can Play" status correctly', () => {
    render(<StatusBadge status="can_play" />);
    expect(screen.getByText('Can Play')).toBeInTheDocument();
  });

  it('renders "Nailed It" status correctly', () => {
    render(<StatusBadge status="nailed_it" />);
    expect(screen.getByText('Nailed It')).toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(<StatusBadge status="want_to_jam" className="custom-class" />);
    const badge = container.querySelector('.custom-class');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct background color class for want_to_jam status', () => {
    const { container } = render(<StatusBadge status="want_to_jam" />);
    const badge = container.querySelector('.bg-\\[var\\(--color-status-want\\)\\]');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct background color class for learning status', () => {
    const { container } = render(<StatusBadge status="learning" />);
    const badge = container.querySelector('.bg-\\[var\\(--color-status-learning\\)\\]');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct background color class for can_play status', () => {
    const { container } = render(<StatusBadge status="can_play" />);
    const badge = container.querySelector('.bg-\\[var\\(--color-status-can-play\\)\\]');
    expect(badge).toBeInTheDocument();
  });

  it('applies correct background color class for nailed_it status', () => {
    const { container } = render(<StatusBadge status="nailed_it" />);
    const badge = container.querySelector('.bg-\\[var\\(--color-status-nailed\\)\\]');
    expect(badge).toBeInTheDocument();
  });
});
