import type { CSSProperties, ReactNode } from "react";
import { DesktopRemoteApp } from "./remote-app";
import {
  getAppDesktopType,
  getAppLauncherDesktopType,
  getDesktopItemAppId,
} from "./identify";
import type {
  AppMode,
  DesktopAppConfig,
  DesktopItemData,
  DesktopSortItem,
} from "./types";

export type DesktopAppAvailabilityStatus =
  | "available"
  | "checking"
  | "unavailable";

export interface DesktopAppAvailability<AppSource = unknown> {
  status: DesktopAppAvailabilityStatus;
  app?: AppSource;
  reason?: string;
}

export interface DesktopItemIconPayload<AppSource = unknown> {
  item: DesktopSortItem<DesktopItemData>;
  appId: string;
  appConfig?: DesktopAppConfig;
  app?: AppSource;
}

export interface DesktopItemIconSdkPayload<AppSource = unknown>
  extends DesktopItemIconPayload<AppSource> {
  sizeId: string;
  mode: AppMode;
}

export interface DesktopItemImageIconPayload<AppSource = unknown> {
  item: DesktopSortItem<DesktopItemData>;
  src?: string | null;
  name?: string;
  objectFit: "cover" | "contain";
  appConfig?: DesktopAppConfig;
  app?: AppSource;
}

export interface DesktopItemAvailabilityIconPayload<AppSource = unknown>
  extends DesktopItemImageIconPayload<AppSource> {
  status: Exclude<DesktopAppAvailabilityStatus, "available">;
  availability: DesktopAppAvailability<AppSource>;
}

export interface CreateDesktopItemIconBuilderOptions<
  Sdk = unknown,
  AppSource = unknown,
> {
  createSdk?: (
    payload: DesktopItemIconSdkPayload<AppSource>,
  ) => Sdk | undefined;
  resolveAppAvailability?: (
    appId: string,
    item: DesktopSortItem<DesktopItemData>,
  ) => DesktopAppAvailability<AppSource>;
  resolveAppConfig?: (
    payload: DesktopItemIconPayload<AppSource>,
  ) => DesktopAppConfig | null | undefined;
  renderImageIcon: (
    payload: DesktopItemImageIconPayload<AppSource>,
  ) => ReactNode;
  renderAvailabilityPlaceholder?: (
    payload: DesktopItemAvailabilityIconPayload<AppSource>,
  ) => ReactNode;
  onAppComponentClick?: (
    payload: DesktopItemIconPayload<AppSource> & {
      appConfig: DesktopAppConfig;
    },
  ) => void;
  appNameFallback?: string | ((item: DesktopSortItem<DesktopItemData>) => string);
  remoteAppClassName?: string;
  remoteAppStyle?: CSSProperties;
  remoteLoadFailedFallback?: (
    payload: DesktopItemImageIconPayload<AppSource>,
  ) => ReactNode;
}

export const getStringDesktopItemIcon = (
  icon: DesktopItemData["icon"] | undefined,
) => (typeof icon === "string" && icon ? icon : null);

const defaultRemoteAppStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  overflow: "hidden",
  borderRadius: "inherit",
};

const getFallbackName = (
  item: DesktopSortItem<DesktopItemData>,
  appConfig: DesktopAppConfig | undefined,
  fallback: CreateDesktopItemIconBuilderOptions["appNameFallback"],
) => {
  if (item.data?.name) return item.data.name;
  if (appConfig?.name) return appConfig.name;
  return typeof fallback === "function" ? fallback(item) : fallback;
};

const normalizeAvailability = <AppSource,>(
  availability?: DesktopAppAvailability<AppSource>,
): DesktopAppAvailability<AppSource> =>
  availability ?? { status: "available" };

export const createDesktopItemIconBuilder = <
  Sdk = unknown,
  AppSource = unknown,
>(
  options: CreateDesktopItemIconBuilderOptions<Sdk, AppSource>,
) => {
  const renderUnavailable = (
    status: Exclude<DesktopAppAvailabilityStatus, "available">,
    payload: DesktopItemImageIconPayload<AppSource>,
    availability: DesktopAppAvailability<AppSource>,
  ) => {
    if (options.renderAvailabilityPlaceholder) {
      return options.renderAvailabilityPlaceholder({
        ...payload,
        status,
        availability,
      });
    }
    return options.renderImageIcon(payload);
  };

  return (item: DesktopSortItem<DesktopItemData>) => {
    const appConfig = item.data?.appConfig;
    const itemIcon = getStringDesktopItemIcon(item.data?.icon);
    const fallbackIcon = (payload?: {
      appConfig?: DesktopAppConfig;
      app?: AppSource;
      icon?: string | null;
      objectFit?: "cover" | "contain";
    }) =>
      options.renderImageIcon({
        item,
        src: payload?.icon ?? itemIcon ?? payload?.appConfig?.appIconUrl,
        name: getFallbackName(
          item,
          payload?.appConfig ?? appConfig,
          options.appNameFallback,
        ),
        objectFit:
          payload?.objectFit ?? (item.data?.url ? "cover" : "contain"),
        appConfig: payload?.appConfig ?? appConfig,
        app: payload?.app,
      });

    const renderRemoteApp = ({
      appId,
      renderConfig,
      mode,
      sizeId,
      app,
      fallback,
      onClick,
    }: {
      appId: string;
      renderConfig: DesktopAppConfig;
      mode: AppMode;
      sizeId: string;
      app?: AppSource;
      fallback: ReactNode;
      onClick?: () => void;
    }) => (
      <DesktopRemoteApp
        config={{
          entry: renderConfig.entry,
          props: renderConfig.props,
          mode,
          sdk: options.createSdk?.({
            item,
            appId,
            appConfig: renderConfig,
            app,
            sizeId,
            mode,
          }),
        }}
        className={options.remoteAppClassName}
        style={{ ...defaultRemoteAppStyle, ...options.remoteAppStyle }}
        onClick={onClick}
        loadFailedFallback={
          options.remoteLoadFailedFallback?.({
            item,
            src: renderConfig.appIconUrl ?? itemIcon,
            name: getFallbackName(item, renderConfig, options.appNameFallback),
            objectFit: item.data?.url ? "cover" : "contain",
            appConfig: renderConfig,
            app,
          }) ?? fallback
        }
      />
    );

    const appLauncherDesktopType = getAppLauncherDesktopType(item);
    if (appLauncherDesktopType) {
      const appId = getDesktopItemAppId(item) ?? appConfig?.id ?? "";
      const availability = normalizeAvailability(
        appId ? options.resolveAppAvailability?.(appId, item) : undefined,
      );
      const app = availability.app;
      const renderConfig =
        appId && options.resolveAppConfig
          ? (options.resolveAppConfig({
              item,
              appId,
              appConfig,
              app,
            }) ?? appConfig)
          : appConfig;
      const name = getFallbackName(item, renderConfig, options.appNameFallback);
      const icon = renderConfig?.appIconUrl ?? itemIcon;

      if (!appId || availability.status !== "available") {
        return renderUnavailable(
          availability.status === "available" ? "unavailable" : availability.status,
          {
            item,
            src: icon,
            name,
            objectFit: "contain",
            appConfig: renderConfig,
            app,
          },
          availability.status === "available"
            ? { status: "unavailable", reason: "missingAppId" }
            : availability,
        );
      }

      if (renderConfig?.appIcon?.type === "custom") {
        if (!renderConfig.entry) {
          return renderUnavailable(
            "unavailable",
            {
              item,
              src: icon,
              name,
              objectFit: "contain",
              appConfig: renderConfig,
              app,
            },
            { status: "unavailable", reason: "missingEntry" },
          );
        }

        return renderRemoteApp({
          appId,
          renderConfig,
          mode: "appIcon",
          sizeId: "appIcon",
          app,
          fallback: fallbackIcon({
            appConfig: renderConfig,
            app,
            icon,
            objectFit: "contain",
          }),
        });
      }

      if (icon) {
        return options.renderImageIcon({
          item,
          src: icon,
          name,
          objectFit: "contain",
          appConfig: renderConfig,
          app,
        });
      }
    }

    const appDesktopType = getAppDesktopType(item);
    if (appDesktopType) {
      const appId = getDesktopItemAppId(item) ?? appConfig?.id ?? "";
      const availability = normalizeAvailability(
        appId ? options.resolveAppAvailability?.(appId, item) : undefined,
      );
      const app = availability.app;
      const renderConfig =
        appId && options.resolveAppConfig
          ? (options.resolveAppConfig({
              item,
              appId,
              appConfig,
              app,
            }) ?? appConfig)
          : appConfig;
      const name = getFallbackName(item, renderConfig, options.appNameFallback);
      const icon = renderConfig?.appIconUrl ?? itemIcon;

      if (!appId || availability.status !== "available") {
        return renderUnavailable(
          availability.status === "available" ? "unavailable" : availability.status,
          {
            item,
            src: icon,
            name,
            objectFit: "contain",
            appConfig: renderConfig,
            app,
          },
          availability.status === "available"
            ? { status: "unavailable", reason: "missingAppId" }
            : availability,
        );
      }

      if (!renderConfig?.entry) {
        return renderUnavailable(
          "unavailable",
          {
            item,
            src: icon,
            name,
            objectFit: "contain",
            appConfig: renderConfig,
            app,
          },
          { status: "unavailable", reason: "missingEntry" },
        );
      }

      const sizeId =
        typeof item.config?.sizeId === "string"
          ? item.config.sizeId
          : renderConfig.defaultSizeId || "2x2";

      return renderRemoteApp({
        appId,
        renderConfig,
        mode: "icon",
        sizeId,
        app,
        fallback: fallbackIcon({
          appConfig: renderConfig,
          app,
          icon,
          objectFit: "contain",
        }),
        onClick: options.onAppComponentClick
          ? () =>
              options.onAppComponentClick?.({
                item,
                appId,
                appConfig: renderConfig,
                app,
              })
          : undefined,
      });
    }

    if (item.type === "app" && itemIcon) {
      return options.renderImageIcon({
        item,
        src: itemIcon,
        name: getFallbackName(item, appConfig, options.appNameFallback),
        objectFit: item.data?.url ? "cover" : "contain",
        appConfig,
      });
    }

    return null;
  };
};
