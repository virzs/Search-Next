import { Image } from "antd";
import {
  RiApps2Line,
  RiBrush2Fill,
  RiSettingsFill,
  RiStore2Fill,
  RiUserFill,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";
import {
  createDesktopItemIconBuilder,
  createDesktopPreviewAppSdk,
  DESKTOP_FIXED_APP_IDS,
  sharedDesktopPreviewEventBus,
  type DesktopSortItem,
} from "@search-next/desktop";

const transparentImageFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E";

const getIconInitial = (name: string | undefined) =>
  name?.trim()?.charAt(0)?.toUpperCase() ?? "";

const remoteAppClassName = "h-full w-full overflow-hidden rounded-[inherit]";

export type AdminDesktopPreviewThemeMode = "light" | "dark";

const createPreviewThemeInfo = (themeMode: AdminDesktopPreviewThemeMode) => ({
  activeThemeId: themeMode,
  desktopThemeId: themeMode,
  appearanceMode: themeMode,
  resolvedColorScheme: themeMode,
});

export const emitAdminDesktopPreviewThemeChange = (
  themeMode: AdminDesktopPreviewThemeMode,
) => {
  sharedDesktopPreviewEventBus.emit(
    "theme:change",
    createPreviewThemeInfo(themeMode),
  );
};

const AdminDesktopImageIcon = ({
  src,
  name,
  objectFit = "contain",
}: {
  src?: string | null;
  name?: string;
  objectFit?: "cover" | "contain";
}) => (
  <span className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]">
    {!src ? (
      <span className="absolute inset-0 flex items-center justify-center bg-gray-100 text-base font-bold text-gray-400">
        {getIconInitial(name) || <RiApps2Line size={22} />}
      </span>
    ) : null}
    {src ? (
      <Image
        src={src}
        alt={name}
        preview={false}
        fallback={transparentImageFallback}
        rootClassName={desktopImageIconRootClassName}
        className={[
          desktopImageIconImageClassName,
          objectFit === "cover"
            ? desktopImageIconCoverClassName
            : desktopImageIconContainClassName,
        ].join(" ")}
      />
    ) : null}
  </span>
);

const createFixedPlaceholder = ({
  name,
  IconComponent,
  className,
  iconSize,
}: {
  name: string;
  IconComponent: RemixiconComponentType;
  className: string;
  iconSize?: number;
}) => (
  <button
    type="button"
    title={name}
    aria-label={name}
    className={[
      "pointer-events-none flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border-0 p-0",
      className,
    ].join(" ")}
  >
    <IconComponent size={iconSize ?? 30} />
  </button>
);

export const createAdminFixedItemBuilder = (item: DesktopSortItem) => {
  switch (item.id) {
    case DESKTOP_FIXED_APP_IDS.account:
      return createFixedPlaceholder({
        name: "账号",
        IconComponent: RiUserFill,
        className: "bg-gradient-to-br from-[#ff6b6b] to-[#f06595] text-white",
      });
    case DESKTOP_FIXED_APP_IDS.personalization:
      return createFixedPlaceholder({
        name: "个性化",
        IconComponent: RiBrush2Fill,
        className:
          "bg-[conic-gradient(from_0deg_at_center,#ff0000_0deg,#ff8000_60deg,#ffff00_120deg,#80ff00_180deg,#00ff80_240deg,#0080ff_300deg,#ff0000_360deg)] text-white",
        iconSize: 28,
      });
    case DESKTOP_FIXED_APP_IDS.store:
      return createFixedPlaceholder({
        name: "应用商店",
        IconComponent: RiStore2Fill,
        className:
          "bg-gradient-to-br from-[#0066ff] via-[#3399ff] to-[#66b3ff] text-white",
      });
    case DESKTOP_FIXED_APP_IDS.settings:
      return createFixedPlaceholder({
        name: "设置",
        IconComponent: RiSettingsFill,
        className: "bg-gradient-to-br from-[#f2f2f7] to-[#c7c7cc] text-[#1c1c1e]",
      });
    default:
      return null;
  }
};

export const createAdminDesktopItemIconBuilder = (
  themeMode: AdminDesktopPreviewThemeMode = "light",
) =>
  createDesktopItemIconBuilder({
    appNameFallback: "应用",
    remoteAppClassName,
    remoteAppStyle: { pointerEvents: "none" },
    createSdk: ({ appId, sizeId, mode }) =>
      createDesktopPreviewAppSdk({
        appId,
        sizeId,
        mode,
        theme: createPreviewThemeInfo(themeMode),
        storagePrefix: "search-next-admin-desktop-preview",
      }),
    renderImageIcon: ({ src, name, objectFit }) => {
      return (
        <AdminDesktopImageIcon
          src={src}
          name={name}
          objectFit={objectFit}
        />
      );
    },
  });

export const adminDesktopItemIconBuilder = createAdminDesktopItemIconBuilder();

const desktopImageIconRootClassName =
  "!absolute inset-0 !block h-full w-full [&_.ant-image-img]:block [&_.ant-image-img]:h-full [&_.ant-image-img]:w-full";

const desktopImageIconImageClassName = "!h-full !w-full";

const desktopImageIconCoverClassName = "object-cover";

const desktopImageIconContainClassName = "object-contain";
