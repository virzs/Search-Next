import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "tw:rounded-[20px] tw:border tw:border-[var(--mm-line)] tw:bg-[var(--mm-panel)] tw:text-[var(--mm-fg)] tw:shadow-[0_18px_50px_rgba(20,30,50,.14)]",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("tw:flex tw:items-center tw:justify-between tw:gap-3 tw:p-4", className)} {...props} />
  ),
);
CardHeader.displayName = "CardHeader";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn("tw:p-4 tw:pt-0", className)} {...props} />,
);
CardContent.displayName = "CardContent";

export { Card, CardContent, CardHeader };
