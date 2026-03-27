import { cn } from "@/lib/utils";
import { AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorMessageProps {
  /**
   * Error message text to display
   */
  message: string;
  /**
   * Display style
   * - inline: Compact, field-level error (default)
   * - block: Full-width, page-level error
   */
  inline?: boolean;
  /**
   * Whether the error can be dismissed
   */
  dismissible?: boolean;
  /**
   * Callback when error is dismissed
   */
  onDismiss?: () => void;
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function ErrorMessage({
  message,
  inline = true,
  dismissible = false,
  onDismiss,
  className,
}: ErrorMessageProps) {
  if (inline) {
    // Inline error: Simple text with icon
    return (
      <div className={cn("flex items-start gap-1.5 text-sm font-medium text-destructive", className)}>
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{message}</span>
      </div>
    );
  }

  // Block error: Full alert box with optional dismiss
  return (
    <div
      className={cn(
        "relative rounded-lg border border-destructive/50 bg-destructive/10 p-4",
        className
      )}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive">{message}</p>
        </div>
        {dismissible && onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0 hover:bg-destructive/20"
            onClick={onDismiss}
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>
    </div>
  );
}

ErrorMessage.displayName = "ErrorMessage";
