import React, { HTMLAttributes } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'red' | 'amber' | 'green' | 'blue' | 'gray';
  size?: 'small' | 'medium';
  dot?: boolean;
  icon?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gray',
  size = 'medium',
  dot = false,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center font-mono font-medium rounded-full transition-all duration-200';

  const variantStyles = {
    red: 'bg-primary/10 text-primary border border-primary/20',
    amber: 'bg-status-learning/10 text-status-learning border border-status-learning/20',
    green: 'bg-status-nailed/10 text-status-nailed border border-status-nailed/20',
    blue: 'bg-status-can-play/10 text-status-can-play border border-status-can-play/20',
    gray: 'bg-subtle/10 text-muted border border-subtle/20',
  };

  const sizeStyles = {
    small: 'px-2 py-0.5 text-xs gap-1',
    medium: 'px-2.5 py-1 text-sm gap-1.5',
  };

  const dotColors = {
    red: 'bg-primary',
    amber: 'bg-status-learning',
    green: 'bg-status-nailed',
    blue: 'bg-status-can-play',
    gray: 'bg-muted',
  };

  const dotSize = size === 'small' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {dot && (
        <span className={`${dotSize} ${dotColors[variant]} rounded-full flex-shrink-0`} aria-hidden="true" />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';

export default Badge;
