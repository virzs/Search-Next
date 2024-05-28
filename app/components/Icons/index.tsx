import DeleteThree from "./DeleteThree";
import Info from "./Info";
import ShareOne from "./ShareOne";

export interface IconProps {
  size?: number;
  color?: string;
}

export const iconDefaultProps: IconProps = {
  size: 20,
  color: "#333",
};

export interface Icons {
  DeleteThree: typeof DeleteThree;
  Info: typeof Info;
  ShareOne: typeof ShareOne;
}

const Icons: Icons = {
  DeleteThree,
  Info,
  ShareOne,
};

export default Icons;
