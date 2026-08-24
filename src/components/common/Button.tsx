import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { children, className, variant = 'primary', size = 'md', isLoading = false, disabled, type = 'button', ...props },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors select-none',
          'focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          {
            'bg-primary text-primary-foreground hover:bg-primary-hover': variant === 'primary',
            'bg-primary-soft text-primary hover:bg-primary hover:text-primary-foreground': variant === 'secondary',
            'bg-danger text-white hover:bg-danger/90': variant === 'danger',
            'border border-border bg-surface text-text hover:bg-surface-muted': variant === 'outline',
            'bg-transparent text-text-secondary hover:bg-surface-muted hover:text-text': variant === 'ghost',
          },
          {
            'h-8 px-3 text-xs': size === 'sm',
            'h-9 px-3.5 text-sm': size === 'md',
            'h-10 px-4 text-sm': size === 'lg',
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
