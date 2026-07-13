import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

export const TooltipProvider = TooltipPrimitive.Provider;
export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  return <TooltipPrimitive.Root delayDuration={420}><TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger><TooltipPrimitive.Content sideOffset={7} className="tw:z-[100] tw:rounded-lg tw:bg-[#202124] tw:px-2.5 tw:py-1.5 tw:text-[11px] tw:font-semibold tw:text-white tw:shadow-lg">{label}<TooltipPrimitive.Arrow className="tw:fill-[#202124]" /></TooltipPrimitive.Content></TooltipPrimitive.Root>;
}
