import { Image } from "antd";
import { css, cx } from "@emotion/css";
import {
  RiApps2Line,
  RiBrush2Fill,
  RiSettingsFill,
  RiStore2Fill,
  RiUserFill,
} from "@remixicon/react";
import type { RemixiconComponentType } from "@remixicon/react";
import {
  DESKTOP_FIXED_APP_IDS,
  type DesktopItemData,
  type DesktopSortItem,
} from "@search-next/desktop";

const transparentImageFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E";

const getStringIcon = (icon: DesktopItemData["icon"] | undefined) =>
  typeof icon === "string" && icon ? icon : null;

const getIconInitial = (name: string | undefined) =>
  name?.trim()?.charAt(0)?.toUpperCase() ?? "";

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
        className={cx(
          desktopImageIconImageClassName,
          objectFit === "cover"
            ? desktopImageIconCoverClassName
            : desktopImageIconContainClassName,
        )}
      />
    ) : null}
  </span>
);

const createFixedPlaceholder = ({
  name,
  IconComponent,
  backgroundStyle,
  iconSize,
  iconColor = "#fff",
}: {
  name: string;
  IconComponent: RemixiconComponentType;
  backgroundStyle: string;
  iconSize?: number;
  iconColor?: string;
}) => (
  <button
    type="button"
    title={name}
    aria-label={name}
    className={cx(
      "flex h-14 w-14 items-center justify-center overflow-hidden rounded-[16px] border-0 p-0",
      css`
        ${backgroundStyle}
        color: ${iconColor};
        pointer-events: none;
      `,
    )}
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
        backgroundStyle:
          "background: linear-gradient(135deg, #ff6b6b 0%, #f06595 100%);",
      });
    case DESKTOP_FIXED_APP_IDS.personalization:
      return createFixedPlaceholder({
        name: "个性化",
        IconComponent: RiBrush2Fill,
        backgroundStyle: `background: conic-gradient(from 0deg at center,
          #ff0000 0deg, #ff8000 60deg, #ffff00 120deg,
          #80ff00 180deg, #00ff80 240deg, #0080ff 300deg, #ff0000 360deg);`,
        iconSize: 28,
      });
    case DESKTOP_FIXED_APP_IDS.store:
      return createFixedPlaceholder({
        name: "应用商店",
        IconComponent: RiStore2Fill,
        backgroundStyle:
          "background: linear-gradient(135deg, #0066ff 0%, #3399ff 50%, #66b3ff 100%);",
      });
    case DESKTOP_FIXED_APP_IDS.settings:
      return createFixedPlaceholder({
        name: "设置",
        IconComponent: RiSettingsFill,
        backgroundStyle:
          "background: linear-gradient(135deg, #f2f2f7 0%, #c7c7cc 100%);",
        iconColor: "#1c1c1e",
      });
    default:
      return null;
  }
};

export const adminDesktopItemIconBuilder = (
  item: DesktopSortItem<DesktopItemData>,
) => {
  const name = item.data?.name;
  const icon =
    getStringIcon(item.data?.icon) ?? item.data?.appConfig?.appIconUrl;
  if (!icon) return null;
  return (
    <AdminDesktopImageIcon
      src={icon}
      name={name}
      objectFit={item.data?.url ? "cover" : "contain"}
    />
  );
};

const desktopImageIconRootClassName = css`
  position: absolute !important;
  inset: 0;
  display: block !important;
  width: 100%;
  height: 100%;

  .ant-image-img {
    display: block;
    width: 100%;
    height: 100%;
  }
`;

const desktopImageIconImageClassName = css`
  width: 100% !important;
  height: 100% !important;
`;

const desktopImageIconCoverClassName = css`
  object-fit: cover;
`;

const desktopImageIconContainClassName = css`
  object-fit: contain;
`;
