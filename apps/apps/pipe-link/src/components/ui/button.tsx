import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "tw:inline-flex tw:items-center tw:justify-center tw:gap-2 tw:whitespace-nowrap tw:rounded-md tw:text-sm tw:font-semibold tw:transition-colors tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-cyan-300/60 tw:disabled:pointer-events-none tw:disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "tw:bg-cyan-500 tw:text-slate-950 tw:hover:bg-cyan-300",
        secondary: "tw:bg-white/12 tw:text-current tw:shadow-sm tw:hover:bg-white/20",
        ghost: "tw:bg-transparent tw:text-current tw:hover:bg-white/16",
      },
      size: {
        default: "tw:h-9 tw:px-4 tw:py-2",
        sm: "tw:h-8 tw:px-3 tw:text-xs",
        icon: "tw:h-8 tw:w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} data-slot="button" {...props} />;
}

export { Button, buttonVariants };
