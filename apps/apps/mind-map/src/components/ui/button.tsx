import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "tw:inline-flex tw:shrink-0 tw:appearance-none tw:items-center tw:justify-center tw:gap-1.5 tw:rounded-[10px] tw:border-0 tw:font-semibold tw:outline-none tw:transition-[transform,background-color,color,box-shadow] tw:duration-150 tw:active:scale-[.96] tw:disabled:pointer-events-none tw:disabled:opacity-35 tw:focus-visible:ring-2 tw:focus-visible:ring-[var(--mm-accent)] tw:focus-visible:ring-offset-2 tw:focus-visible:ring-offset-[var(--mm-panel)]",
  { variants: {
    variant: {
      default: "tw:bg-[var(--mm-accent)] tw:text-white tw:shadow-[0_2px_8px_rgba(34,100,220,.2)] tw:hover:brightness-105",
      secondary: "tw:bg-[var(--mm-control)] tw:text-[var(--mm-fg)] tw:hover:bg-[var(--mm-control-hover)]",
      ghost: "tw:bg-transparent tw:text-[var(--mm-muted)] tw:hover:bg-[var(--mm-control)] tw:hover:text-[var(--mm-fg)]",
      destructive: "tw:bg-red-500/12 tw:text-red-600 tw:hover:bg-red-500/18",
    },
    size: { default: "tw:h-8 tw:px-3 tw:text-[13px]", sm: "tw:h-8 tw:px-2.5 tw:text-[13px]", icon: "tw:size-8 tw:p-0" },
  }, defaultVariants: { variant: "secondary", size: "default" } },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Component = asChild ? Slot : "button";
  return <Component className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />;
});
Button.displayName = "Button";
