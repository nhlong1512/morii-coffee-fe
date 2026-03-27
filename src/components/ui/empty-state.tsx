import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  /**
   * Icon element to display
   */
  icon?: React.ReactNode;
  /**
   * Title text
   */
  title: string;
  /**
   * Optional description text
   */
  description?: string;
  /**
   * Optional action button
   */
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /**
   * Additional CSS classes
   */
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground/25 bg-muted/20 p-8 text-center",
        className
      )}
    >
      {icon && (
        <div className="mb-4 text-muted-foreground/50">
          {icon}
        </div>
      )}

      <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>

      {description && (
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {action && (
        <>
          {action.href ? (
            <Button asChild>
              <Link href={action.href}>{action.label}</Link>
            </Button>
          ) : (
            <Button onClick={action.onClick}>{action.label}</Button>
          )}
        </>
      )}
    </div>
  );
}

EmptyState.displayName = "EmptyState";
