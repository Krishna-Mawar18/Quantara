import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]",
          {
            "bg-violet-600 text-white hover:bg-violet-700 focus:ring-violet-500 shadow-sm shadow-violet-200":
              variant === "primary",
            "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-400":
              variant === "secondary",
            "border border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300 focus:ring-zinc-400":
              variant === "outline",
            "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 focus:ring-zinc-400":
              variant === "ghost",
            "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-sm shadow-red-200":
              variant === "danger",
          },
          {
            "text-xs px-3 py-1.5 gap-1.5": size === "sm",
            "text-[13px] px-4 py-2 gap-2": size === "md",
            "text-sm px-6 py-2.5 gap-2": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-0.5 mr-1 h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="3"
            />
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

Button.displayName = "Button";
export { Button };
