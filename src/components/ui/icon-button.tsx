"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  badge?: number;
  badgeVariant?: "primary" | "destructive";
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      badge,
      badgeVariant = "primary",
      children,
      ...props
    },
    ref
  ) => {
    const badgeClassName = {
      primary: "bg-primary text-primary-foreground",
      destructive: "bg-destructive text-destructive-foreground",
    }[badgeVariant];

    return (
      <button
        ref={ref}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background transition-colors hover:bg-accent",
          className
        )}
        {...props}
      >
        {children}
        {badge != null && badge > 0 ? (
          <span
            className={cn(
              "absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold",
              badgeClassName
            )}
          >
            {badge > 99 ? "99+" : badge}
          </span>
        ) : null}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
