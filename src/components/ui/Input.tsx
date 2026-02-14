import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

interface BaseInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement>, BaseInputProps {
  variant?: 'text';
}

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement>, BaseInputProps {
  variant: 'textarea';
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement>, BaseInputProps {
  variant: 'select';
  options?: { value: string; label: string }[];
}

type AllInputProps = InputProps | TextareaProps | SelectProps;

const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, AllInputProps>(
  ({ label, error, helperText, className = '', variant = 'text', ...props }, ref) => {
    const baseStyles =
      'w-full bg-surface border rounded-md px-3 py-2 text-foreground placeholder:text-subtle transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background';

    const normalStyles = 'border-border hover:border-muted focus:border-primary focus:ring-primary';
    const errorStyles = 'border-primary focus:border-primary focus:ring-primary';

    const inputClassName = `${baseStyles} ${error ? errorStyles : normalStyles} ${className}`;

    const labelId = label ? `input-${Math.random().toString(36).substr(2, 9)}` : undefined;

    const renderInput = () => {
      if (variant === 'textarea') {
        const textareaProps = props as TextareaHTMLAttributes<HTMLTextAreaElement>;
        return (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={labelId}
            rows={4}
            className={inputClassName}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${labelId}-error` : helperText ? `${labelId}-helper` : undefined}
            {...textareaProps}
          />
        );
      }

      if (variant === 'select') {
        const selectProps = props as SelectProps;
        const { options = [], ...restSelectProps } = selectProps;
        return (
          <select
            ref={ref as React.Ref<HTMLSelectElement>}
            id={labelId}
            className={inputClassName}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${labelId}-error` : helperText ? `${labelId}-helper` : undefined}
            {...restSelectProps}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
            {restSelectProps.children}
          </select>
        );
      }

      const inputProps = props as InputHTMLAttributes<HTMLInputElement>;
      return (
        <input
          ref={ref as React.Ref<HTMLInputElement>}
          id={labelId}
          type="text"
          className={inputClassName}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${labelId}-error` : helperText ? `${labelId}-helper` : undefined}
          {...inputProps}
        />
      );
    };

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={labelId} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        {renderInput()}
        {error && (
          <p id={`${labelId}-error`} className="mt-1.5 text-sm text-primary" role="alert">
            {error}
          </p>
        )}
        {!error && helperText && (
          <p id={`${labelId}-helper`} className="mt-1.5 text-sm text-muted">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
