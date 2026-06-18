import Avatar from "boring-avatars";
import type { SVGProps } from "react";

const bauhausAvatarColors = [
  "#f7f2e8",
  "#0a84ff",
  "#ff3b30",
  "#ffcc00",
  "#1d1d1f",
];

export interface BoringAccountAvatarProps
  extends Omit<SVGProps<SVGSVGElement>, "seed"> {
  seed?: string | null;
  size?: number | string;
}

const BoringAccountAvatar = ({
  seed,
  size = "100%",
  ...props
}: BoringAccountAvatarProps) => (
  <Avatar
    {...props}
    name={seed?.trim() || "Search Next"}
    variant="bauhaus"
    colors={bauhausAvatarColors}
    size={size}
    title={false}
  />
);

export default BoringAccountAvatar;
