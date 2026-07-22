import { css, cx } from "@emotion/css";
import {
  useCallback,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { DesktopSearchBar } from "@/components/unified-search";

type DesktopSearchBarProps = ComponentProps<typeof DesktopSearchBar>;

interface DesktopLayoutBaseProps {
  toolbar: ReactNode;
  searchProps: DesktopSearchBarProps;
}

interface StandardDesktopLayoutProps extends DesktopLayoutBaseProps {
  children: ReactNode;
  showSearch: boolean;
}

type ZenDesktopLayoutProps = DesktopLayoutBaseProps;

const DesktopToolbar = ({ children }: { children: ReactNode }) => (
  <div
    data-wallpaper-interactive
    className="mx-auto flex w-full max-w-7xl items-center justify-end gap-2 px-6 py-2"
  >
    {children}
  </div>
);

export const StandardDesktopLayout = ({
  toolbar,
  searchProps,
  showSearch,
  children,
}: StandardDesktopLayoutProps) => (
  <div
    data-desktop-layout="standard"
    className={cx(
      "flex min-h-0 flex-1 flex-col",
      desktopLayoutEnterClassName,
    )}
  >
    <DesktopToolbar>{toolbar}</DesktopToolbar>
    {showSearch ? (
      <div data-wallpaper-interactive>
        <DesktopSearchBar {...searchProps} desktopPresentation="standard" />
      </div>
    ) : null}
    <div className="mx-auto min-h-0 w-full max-w-7xl flex-1 pb-8">
      {children}
    </div>
  </div>
);

export const ZenDesktopLayout = ({
  toolbar,
  searchProps,
}: ZenDesktopLayoutProps) => {
  const [searchActive, setSearchActive] = useState(false);
  const externalActiveChange = searchProps.onDesktopActiveChange;
  const handleSearchActiveChange = useCallback(
    (active: boolean) => {
      setSearchActive(active);
      externalActiveChange?.(active);
    },
    [externalActiveChange],
  );

  return (
    <div
      data-desktop-layout="zen"
      className={cx(
        "flex min-h-0 flex-1 flex-col",
        desktopLayoutEnterClassName,
      )}
    >
      <DesktopToolbar>{toolbar}</DesktopToolbar>
      <div className="relative min-h-0 flex-1">
        <div
          data-wallpaper-interactive
          className={cx(
            zenSearchStageClassName,
            searchActive ? zenSearchStageActiveClassName : null,
          )}
        >
          <DesktopSearchBar
            {...searchProps}
            desktopPresentation="zen"
            onDesktopActiveChange={handleSearchActiveChange}
          />
        </div>
      </div>
    </div>
  );
};

const desktopLayoutEnterClassName = css`
  animation: search-next-desktop-layout-in 180ms ease-out both;

  @keyframes search-next-desktop-layout-in {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    animation-duration: 120ms;
  }
`;

const zenSearchStageClassName = css`
  position: absolute;
  top: 30%;
  left: 0;
  width: 100%;
  transform: translateY(-50%);
  will-change: transform;
  transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
`;

const zenSearchStageActiveClassName = css`
  transform: translateY(
    calc(-50% - 30vh + clamp(84px, 10vh, 120px))
  );

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;
