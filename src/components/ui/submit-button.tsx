import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

export type SubmitButtonProps = ComponentProps<typeof Button> & {
  /** When true, shows spinner overlay, blurs label, disables interaction */
  pending?: boolean;
};

/**
 * Primary actions (admin shadcn `Button`). Blurs inner content while `pending`; spinner stays sharp.
 */
function SubmitButton({ className, pending, disabled, children, ...props }: SubmitButtonProps) {
  const busy = Boolean(pending);
  return (
    <Button
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={cn(
        'relative overflow-hidden disabled:cursor-not-allowed',
        busy && 'disabled:!opacity-100 opacity-[0.93]',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex items-center justify-center gap-2 transition-[filter]',
          busy && 'blur-[1px] select-none',
        )}
      >
        {children}
      </span>
      {busy ? (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/45 backdrop-blur-[2px]"
          aria-hidden
        >
          <Spinner className="size-5 text-champagne" />
        </span>
      ) : null}
    </Button>
  );
}

export type NativeSubmitButtonProps = ComponentProps<'button'> & {
  pending?: boolean;
};

/**
 * Custom-styled `<button>` (public pages). Same busy treatment as {@link SubmitButton}.
 */
function NativeSubmitButton({ className, pending, disabled, children, ...props }: NativeSubmitButtonProps) {
  const busy = Boolean(pending);
  return (
    <button
      {...props}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      className={cn(
        'relative overflow-hidden disabled:cursor-not-allowed',
        busy && 'disabled:!opacity-100 opacity-[0.93]',
        className,
      )}
    >
      <span
        className={cn(
          'inline-flex w-full items-center justify-center gap-2 transition-[filter]',
          busy && 'blur-[1px] select-none',
        )}
      >
        {children}
      </span>
      {busy ? (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-[inherit] bg-black/45 backdrop-blur-[2px]"
          aria-hidden
        >
          <Spinner className="size-5 text-champagne shrink-0" />
        </span>
      ) : null}
    </button>
  );
}

export { SubmitButton, NativeSubmitButton };
