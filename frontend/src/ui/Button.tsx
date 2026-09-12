interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export function Button({ isLoading, children, disabled, className = "", ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`w-full rounded-sm bg-(--primary) cursor-pointer py-2.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          Signing in
        </span>
      ) : (
        children
      )}
    </button>
  );
}