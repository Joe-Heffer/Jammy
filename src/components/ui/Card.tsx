import React, { forwardRef, HTMLAttributes } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'small' | 'medium' | 'large';
  header?: React.ReactNode;
  footer?: React.ReactNode;
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      padding = 'medium',
      header,
      footer,
      hoverable = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'bg-surface border border-border rounded-lg transition-all duration-300';

    const hoverStyles = hoverable
      ? 'hover:border-primary hover:shadow-[0_0_20px_rgba(220,38,38,0.15)]'
      : '';

    const paddingStyles = {
      none: '',
      small: 'p-3',
      medium: 'p-4',
      large: 'p-6',
    };

    const contentPadding = header || footer ? '' : paddingStyles[padding];

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${hoverStyles} ${contentPadding} ${className}`}
        {...props}
      >
        {header && (
          <div className={`border-b border-border ${paddingStyles[padding]} pb-3`}>
            {header}
          </div>
        )}
        {header || footer ? (
          <div className={paddingStyles[padding]}>{children}</div>
        ) : (
          children
        )}
        {footer && (
          <div className={`border-t border-border ${paddingStyles[padding]} pt-3`}>
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
