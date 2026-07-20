/* eslint-disable react-refresh/only-export-components -- shadcn co-locates CVA variants with the component. */
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-[var(--sn-radius-control)] border text-sm font-semibold leading-none outline-none transition-[transform,color,background-color,border-color,box-shadow,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 active:scale-[0.98] motion-reduce:active:scale-100 motion-reduce:transition-colors [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--sn-accent)] text-[var(--sn-on-accent)] shadow-[0_8px_18px_rgba(0,0,0,0.16)] hover:bg-[var(--sn-accent-hover)] active:bg-[var(--sn-accent-active)]",
        destructive:
          "border-transparent bg-[#ff3b30] text-white shadow-[0_8px_18px_rgba(255,59,48,0.2)] hover:bg-[#ff453a]",
        outline:
          "border-[var(--sn-separator)] bg-[var(--sn-surface-secondary)] text-[var(--sn-text)] shadow-sm hover:bg-[var(--sn-surface-strong)]",
        secondary:
          "border-transparent bg-[var(--sn-surface-secondary)] text-[var(--sn-text)] hover:bg-[var(--sn-surface-strong)]",
        ghost:
          "border-transparent bg-transparent text-[var(--sn-text-secondary)] shadow-none hover:bg-[var(--sn-surface-secondary)] hover:text-[var(--sn-text)]",
        link:
          "border-transparent bg-transparent px-0! text-[var(--sn-accent-text)] shadow-none underline-offset-4 hover:underline",
        destructiveOutline:
          "border-[#ff3b30]/45 bg-transparent text-[#d92d20] shadow-none hover:bg-[#ff3b30]/10 dark:text-[#ff6961]",
        destructiveGhost:
          "border-transparent bg-transparent text-[#d92d20] shadow-none hover:bg-[#ff3b30]/10 dark:text-[#ff6961]",
        destructiveLink:
          "border-transparent bg-transparent px-0! text-[#d92d20] shadow-none underline-offset-4 hover:underline dark:text-[#ff6961]",
      },
      size: {
        small: "h-[var(--sn-control-height-sm)] gap-1.5 px-3 text-xs",
        default: "h-[var(--sn-control-height)] px-[18px]",
        large: "h-[var(--sn-control-height-lg)] px-5 text-sm",
      },
      iconOnly: {
        true: "aspect-square rounded-[var(--sn-radius-round)] px-0",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      iconOnly: false,
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      iconOnly,
      asChild = false,
      type,
      ...props
    },
    ref,
  ) => {
    const Component = asChild ? Slot : "button";

    return (
      <Component
        ref={ref}
        data-slot="button"
        data-variant={variant}
        data-size={size}
        data-icon-only={iconOnly ? "true" : undefined}
        className={cn(
          buttonVariants({ variant, size, iconOnly }),
          className,
        )}
        {...(!asChild ? { type: type ?? "button" } : {})}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
