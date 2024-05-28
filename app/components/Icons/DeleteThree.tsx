import { FC } from "react";
import { IconProps, iconDefaultProps } from ".";

const DeleteThree: FC<IconProps> = (props) => {
  const { size, color } = { ...iconDefaultProps, ...props };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="24"
        cy="24"
        r="20"
        fill="none"
        stroke={color}
        stroke-width="4"
      />
      <path
        d="M17 31L31 17"
        stroke={color}
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M19 19L17 17"
        stroke={color}
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <path
        d="M31 31L29 29"
        stroke={color}
        stroke-width="4"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  );
};

export default DeleteThree;
