import { css, cx } from "@emotion/css";
import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";

export interface AppCategoryRailOption<
  ValueType extends string | number = string,
> {
  label: ReactNode;
  value: ValueType;
  disabled?: boolean;
}

export interface AppCategoryRailProps<
  ValueType extends string | number = string,
> {
  options: AppCategoryRailOption<ValueType>[];
  value: ValueType;
  onChange: (value: ValueType) => void;
  ariaLabel: string;
  previousLabel: string;
  nextLabel: string;
  className?: string;
}

const SCROLL_TOLERANCE = 2;

export default function AppCategoryRail<
  ValueType extends string | number = string,
>({
  options,
  value,
  onChange,
  ariaLabel,
  previousLabel,
  nextLabel,
  className,
}: AppCategoryRailProps<ValueType>) {
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const maxScrollLeft = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    setCanScrollLeft(scroller.scrollLeft > SCROLL_TOLERANCE);
    setCanScrollRight(
      scroller.scrollLeft < maxScrollLeft - SCROLL_TOLERANCE,
    );
  }, []);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    updateScrollState();
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(scroller);
    Array.from(scroller.children).forEach((child) => observer.observe(child));

    return () => observer.disconnect();
  }, [options, updateScrollState]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const active = scroller.querySelector<HTMLElement>(
      '[role="radio"][aria-checked="true"]',
    );
    active?.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "nearest",
    });
    requestAnimationFrame(updateScrollState);
  }, [updateScrollState, value]);

  const scrollByPage = (direction: -1 | 1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    scroller.scrollBy({
      left: direction * Math.max(160, scroller.clientWidth * 0.66),
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  const handleKeyDown = (
    event: ReactKeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    const enabledIndexes = options
      .map((option, index) => (option.disabled ? -1 : index))
      .filter((index) => index >= 0);
    if (!enabledIndexes.length) return;

    const currentEnabledIndex = enabledIndexes.indexOf(currentIndex);
    let nextIndex: number | undefined;
    if (event.key === "ArrowRight") {
      nextIndex =
        enabledIndexes[(currentEnabledIndex + 1) % enabledIndexes.length];
    } else if (event.key === "ArrowLeft") {
      nextIndex =
        enabledIndexes[
          (currentEnabledIndex - 1 + enabledIndexes.length) %
            enabledIndexes.length
        ];
    } else if (event.key === "Home") {
      nextIndex = enabledIndexes[0];
    } else if (event.key === "End") {
      nextIndex = enabledIndexes[enabledIndexes.length - 1];
    } else {
      return;
    }

    if (nextIndex == null) return;
    event.preventDefault();
    const option = options[nextIndex];
    onChange(option.value);
    const buttons = scrollerRef.current?.querySelectorAll<HTMLButtonElement>(
      '[role="radio"]',
    );
    buttons?.[nextIndex]?.focus();
  };

  return (
    <div
      className={cx(appCategoryRailClassName, className)}
      data-scroll-left={canScrollLeft || undefined}
      data-scroll-right={canScrollRight || undefined}
    >
      {canScrollLeft ? (
        <button
          type="button"
          className="category-scroll-button category-scroll-button-left"
          aria-label={previousLabel}
          onClick={() => scrollByPage(-1)}
        >
          <RiArrowLeftSLine size={17} />
        </button>
      ) : null}

      <div
        ref={scrollerRef}
        className="category-scroll-area"
        role="radiogroup"
        aria-label={ariaLabel}
        onScroll={updateScrollState}
      >
        {options.map((option, index) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={option.disabled}
              tabIndex={selected ? 0 : -1}
              className="category-item"
              onClick={() => onChange(option.value)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>

      {canScrollRight ? (
        <button
          type="button"
          className="category-scroll-button category-scroll-button-right"
          aria-label={nextLabel}
          onClick={() => scrollByPage(1)}
        >
          <RiArrowRightSLine size={17} />
        </button>
      ) : null}
    </div>
  );
}

const appCategoryRailClassName = css`
  position: relative;
  width: max-content;
  min-width: 0;
  max-width: 100%;

  .category-scroll-area {
    display: flex;
    width: max-content;
    min-width: 0;
    max-width: 100%;
    align-items: center;
    gap: 5px;
    overflow-x: auto;
    overflow-y: hidden;
    padding: 3px;
    border: 1px solid var(--sn-separator, rgba(60, 60, 67, 0.12));
    border-radius: 12px;
    background: color-mix(
      in srgb,
      var(--sn-surface-secondary, #f2f2f7) 88%,
      transparent
    );
    scrollbar-width: none;
    scroll-snap-type: x proximity;
    overscroll-behavior-x: contain;
    touch-action: pan-x;
    -webkit-overflow-scrolling: touch;
  }

  .category-scroll-area::-webkit-scrollbar {
    display: none;
  }

  &[data-scroll-left] .category-scroll-area {
    padding-left: 34px;
  }

  &[data-scroll-right] .category-scroll-area {
    padding-right: 34px;
  }

  .category-item {
    display: inline-flex;
    min-height: 30px;
    flex: 0 0 auto;
    cursor: pointer;
    scroll-snap-align: center;
    align-items: center;
    justify-content: center;
    border: 1px solid transparent;
    border-radius: 9px;
    background: transparent;
    padding: 5px 11px;
    color: var(--sn-text-secondary, #6e6e73);
    font: inherit;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    white-space: nowrap;
    transition:
      transform 100ms ease-out,
      border-color 140ms ease,
      background-color 140ms ease,
      color 140ms ease,
      box-shadow 140ms ease;
  }

  .category-item:hover:not(:disabled) {
    background: color-mix(
      in srgb,
      var(--sn-surface-strong, #fff) 68%,
      transparent
    );
    color: var(--sn-text, #1d1d1f);
  }

  .category-item:active:not(:disabled) {
    transform: scale(0.97);
  }

  .category-item[aria-checked="true"] {
    border-color: color-mix(
      in srgb,
      var(--sn-accent, #007aff) 18%,
      var(--sn-separator, transparent)
    );
    background: var(--sn-surface-strong, #fff);
    color: var(--sn-text, #1d1d1f);
    box-shadow:
      0 1px 3px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.5);
  }

  .category-item:focus-visible,
  .category-scroll-button:focus-visible {
    outline: 2px solid
      color-mix(in srgb, var(--sn-accent, #007aff) 62%, transparent);
    outline-offset: 1px;
  }

  .category-item:disabled {
    cursor: default;
    opacity: 0.45;
  }

  .category-scroll-button {
    position: absolute;
    z-index: 2;
    top: 50%;
    display: grid;
    width: 26px;
    height: 26px;
    cursor: pointer;
    place-items: center;
    border: 1px solid var(--sn-separator, rgba(60, 60, 67, 0.12));
    border-radius: 8px;
    background: color-mix(
      in srgb,
      var(--sn-surface-strong, #fff) 92%,
      transparent
    );
    color: var(--sn-text, #1d1d1f);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    transform: translateY(-50%);
    backdrop-filter: blur(16px) saturate(1.25);
  }

  .category-scroll-button:active {
    transform: translateY(-50%) scale(0.94);
  }

  .category-scroll-button-left {
    left: 5px;
  }

  .category-scroll-button-right {
    right: 5px;
  }

  @media (prefers-reduced-motion: reduce) {
    .category-item {
      transition: none;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    .category-scroll-area,
    .category-scroll-button {
      background: var(--sn-surface-strong, #fff);
      backdrop-filter: none;
    }
  }
`;
