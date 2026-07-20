import { forwardRef } from "react";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  MouseEventHandler,
  ReactNode,
  Ref,
} from "react";
import { RiLoader4Line } from "@remixicon/react";
import { Button } from "../button";
import type { ButtonProps } from "../button";
import { cn } from "@/lib/utils";

export type AppButtonIntent =
  | "primary"
  | "secondary"
  | "quiet"
  | "link"
  | "danger";

/**
 * small (24px): dense rows, cards, toolbars and inline actions.
 * default (32px): standard page, form and dialog actions.
 * large (40px): reserve for a single essential task such as sign-in.
 */
export type AppButtonSize = "small" | "default" | "large";
export type AppButtonElement = HTMLButtonElement | HTMLAnchorElement;

export interface AppButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "onClick" | "type"
  > {
  intent?: AppButtonIntent;
  danger?: boolean;
  loading?: boolean;
  htmlType?: ButtonHTMLAttributes<HTMLButtonElement>["type"];
  /** Opt into a full-width form action; buttons are content-sized by default. */
  block?: boolean;
  icon?: ReactNode;
  size?: AppButtonSize;
  href?: string;
  target?: AnchorHTMLAttributes<HTMLAnchorElement>["target"];
  rel?: string;
  download?: AnchorHTMLAttributes<HTMLAnchorElement>["download"];
  onClick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}

type ShadcnButtonVariant = NonNullable<ButtonProps["variant"]>;
type ShadcnButtonSize = NonNullable<ButtonProps["size"]>;

const resolveVariant = (
  intent: AppButtonIntent,
  danger: boolean,
): ShadcnButtonVariant => {
  if (intent === "danger") return "destructive";
  if (danger && intent === "quiet") return "destructiveGhost";
  if (danger && intent === "link") return "destructiveLink";
  if (danger) return "destructiveOutline";

  const variants: Record<AppButtonIntent, ShadcnButtonVariant> = {
    primary: "default",
    secondary: "outline",
    quiet: "ghost",
    link: "link",
    danger: "destructive",
  };

  return variants[intent];
};

const AppButton = forwardRef<AppButtonElement, AppButtonProps>(
  (
    {
      intent: intentProp,
      danger = false,
      loading = false,
      htmlType = "button",
      block = false,
      icon,
      size = "default",
      href,
      target,
      rel,
      download,
      disabled = false,
      children,
      className,
      onClick,
      tabIndex,
      ...props
    },
    ref,
  ) => {
    const intent = intentProp ?? "secondary";
    const effectiveDisabled = disabled || loading;
    const iconOnly = icon != null && children == null;
    const variant = resolveVariant(intent, danger);
    const buttonSize: ShadcnButtonSize = size;
    const buttonClassName = cn(
      "sn-button",
      block && !iconOnly && "w-full",
      className,
    );
    const leadingIcon = loading ? (
      <RiLoader4Line
        aria-hidden="true"
        className="size-4 animate-spin motion-reduce:animate-none"
      />
    ) : (
      icon
    );
    const content = (
      <>
        {leadingIcon ? (
          <span
            data-slot="button-icon"
            className="inline-flex shrink-0 items-center justify-center"
          >
            {leadingIcon}
          </span>
        ) : null}
        {children}
      </>
    );

    if (href !== undefined) {
      const handleAnchorClick: MouseEventHandler<HTMLAnchorElement> = (
        event,
      ) => {
        if (effectiveDisabled) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        onClick?.(event);
      };

      return (
        <Button
          asChild
          variant={variant}
          size={buttonSize}
          iconOnly={iconOnly}
          className={buttonClassName}
          aria-busy={loading || undefined}
          aria-disabled={effectiveDisabled || undefined}
          data-app-intent={intent}
          data-loading={loading ? "true" : undefined}
        >
          <a
            {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
            ref={ref as Ref<HTMLAnchorElement>}
            href={effectiveDisabled ? undefined : href}
            target={target}
            rel={rel}
            download={download}
            tabIndex={effectiveDisabled ? -1 : tabIndex}
            onClick={handleAnchorClick}
          >
            {content}
          </a>
        </Button>
      );
    }

    return (
      <Button
        {...props}
        ref={ref as Ref<HTMLButtonElement>}
        type={htmlType}
        variant={variant}
        size={buttonSize}
        iconOnly={iconOnly}
        className={buttonClassName}
        disabled={effectiveDisabled}
        aria-busy={loading || undefined}
        data-app-intent={intent}
        data-loading={loading ? "true" : undefined}
        tabIndex={tabIndex}
        onClick={onClick as MouseEventHandler<HTMLButtonElement>}
      >
        {content}
      </Button>
    );
  },
);

AppButton.displayName = "AppButton";

export default AppButton;
