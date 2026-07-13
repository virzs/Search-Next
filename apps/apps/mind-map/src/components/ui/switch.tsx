import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitive.Root>, React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root ref={ref} className={cn("tw:relative tw:inline-flex tw:h-[26px] tw:w-[44px] tw:shrink-0 tw:appearance-none tw:cursor-pointer tw:rounded-full tw:border-0 tw:bg-[var(--mm-switch-off)] tw:p-0 tw:outline-none tw:transition-colors tw:data-[state=checked]:bg-[var(--mm-accent)] tw:focus-visible:ring-2 tw:focus-visible:ring-[var(--mm-accent)]", className)} {...props}>
    <SwitchPrimitive.Thumb className="tw:pointer-events-none tw:block tw:size-[22px] tw:translate-x-0.5 tw:rounded-full tw:bg-white tw:shadow-[0_1px_4px_rgba(0,0,0,.28)] tw:transition-transform tw:data-[state=checked]:translate-x-5" />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";
