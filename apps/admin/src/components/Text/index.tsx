import { formatText, FormatTextOptionsPropsType } from "@/utils/utils";
import { cx } from "@emotion/css";
import { Tooltip, TooltipProps } from "antd";
import { useMemo } from "react";

export interface TextProps extends FormatTextOptionsPropsType {
  className?: string;
  tooltip?: boolean;
  style?: React.CSSProperties;
  content?: any;
  tooltipProps?: TooltipProps;
}

const Text: React.FC<TextProps> = (props) => {
  const { tooltip = true, className, style, content, ...rest } = props;

  const textClassName = cx(
    "inline-block max-w-full overflow-hidden text-ellipsis whitespace-nowrap break-all",
    className
  );

  const noContent = (
    <span className={textClassName} style={style}>
      -
    </span>
  );
  if (content === null || content === undefined) {
    return noContent;
  }

  const text = useMemo(() => formatText(content, rest), [content, rest]);

  if (!text) {
    return noContent;
  }

  const element = (
    <span className={textClassName} style={style}>
      {text}
    </span>
  );

  if (tooltip) {
    return <Tooltip title={text}>{element}</Tooltip>;
  }

  return element;
};

export default Text;
