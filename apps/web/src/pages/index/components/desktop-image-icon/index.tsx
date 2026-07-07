import { css, cx } from "@emotion/css";
import { RiApps2Line } from "@remixicon/react";
import { Image } from "antd";
import { useEffect, useState } from "react";
import type { DesktopItemData } from "@/types";

const transparentImageFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1' height='1'%3E%3C/svg%3E";

export const getStringIcon = (icon: DesktopItemData["icon"] | undefined) =>
  typeof icon === "string" && icon ? icon : null;

const getIconInitial = (name: string | undefined) =>
  name?.trim()?.charAt(0)?.toUpperCase() ?? "";

interface DesktopImageIconProps {
  src?: string | null;
  name?: string;
  className?: string;
  objectFit?: "cover" | "contain";
}

const DesktopImageIcon = ({
  src,
  name,
  className,
  objectFit = "cover",
}: DesktopImageIconProps) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setLoaded(false);
    setFailed(false);
  }, [src]);

  return (
    <span
      className={cx(
        "relative flex h-full w-full items-center justify-center overflow-hidden rounded-[inherit]",
        className,
      )}
    >
      {(!loaded || failed || !src) && (
        <span className="absolute inset-0 flex items-center justify-center bg-[linear-gradient(135deg,rgba(242,242,247,0.96),rgba(209,213,219,0.86))] text-base font-bold text-[#8e8e93] dark:bg-[linear-gradient(135deg,rgba(58,58,60,0.96),rgba(44,44,46,0.9))] dark:text-[#c7c7cc]">
          {getIconInitial(name) || <RiApps2Line size={22} />}
        </span>
      )}
      {src ? (
        <Image
          src={src}
          alt={name}
          preview={false}
          fallback={transparentImageFallback}
          rootClassName={desktopImageIconRootClassName}
          className={cx(
            desktopImageIconImageClassName,
            objectFit === "contain"
              ? desktopImageIconContainClassName
              : desktopImageIconCoverClassName,
          )}
          onLoad={(event) => {
            const currentSrc = event.currentTarget.currentSrc || "";
            if (!currentSrc.startsWith("data:image/svg+xml")) {
              setLoaded(true);
            }
          }}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
        />
      ) : null}
    </span>
  );
};

export default DesktopImageIcon;

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
