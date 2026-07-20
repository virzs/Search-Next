import { forwardRef } from "react";
import type { ReactNode } from "react";
import AppButton from "../app-button";
import type { AppButtonElement, AppButtonProps } from "../app-button";
import { cn } from "@/lib/utils";

export interface AppIconButtonProps
  extends Omit<AppButtonProps, "aria-label" | "block" | "children"> {
  "aria-label": string;
  icon: ReactNode;
}

const AppIconButton = forwardRef<
  AppButtonElement,
  AppIconButtonProps
>(({ className, ...props }, ref) => (
  <AppButton
    {...props}
    ref={ref}
    className={cn("sn-icon-button", className)}
  />
));

AppIconButton.displayName = "AppIconButton";

export default AppIconButton;
