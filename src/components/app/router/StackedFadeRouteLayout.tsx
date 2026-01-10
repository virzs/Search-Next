import { ReactNode, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import StackedFadeOutlet from "./StackedFadeOutlet";

export interface StackedFadeRouteLayoutProps {
  base: ReactNode;
  basePath: string;
  className?: string;
  baseWrapperClassName?: string;
  outletProps?: React.ComponentProps<typeof StackedFadeOutlet>;
  closeOnValueChange?: {
    value: unknown;
    to?: string;
    replace?: boolean;
  };
}

const StackedFadeRouteLayout = ({
  base,
  basePath,
  className,
  baseWrapperClassName,
  outletProps,
  closeOnValueChange,
}: StackedFadeRouteLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const overlayOpen =
    location.pathname.startsWith(`${basePath}/`) && location.pathname !== basePath;

  const prevCloseValueRef = useRef(closeOnValueChange?.value);
  useEffect(() => {
    if (!closeOnValueChange) return;
    const prev = prevCloseValueRef.current;
    const next = closeOnValueChange.value;
    const changed = prev !== next;
    prevCloseValueRef.current = next;
    if (!changed) return;
    if (!overlayOpen) return;
    navigate(closeOnValueChange.to ?? basePath, {
      replace: closeOnValueChange.replace ?? true,
    });
  }, [basePath, closeOnValueChange, navigate, overlayOpen]);

  return (
    <div className={["h-full relative overflow-hidden", className].filter(Boolean).join(" ")}>
      <div
        className={[
          "h-full flex flex-col overflow-hidden transition-opacity duration-300",
          overlayOpen ? "opacity-0 pointer-events-none" : "opacity-100",
          baseWrapperClassName,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {base}
      </div>
      <StackedFadeOutlet {...outletProps} />
    </div>
  );
};

export default StackedFadeRouteLayout;

