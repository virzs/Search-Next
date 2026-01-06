import { Segmented } from "antd";
import type { SegmentedProps } from "antd";

export default function AppSegmented<ValueType extends string | number = string>(props: SegmentedProps<ValueType>) {
  const { styles, shape, ...rest } = props;

  return <Segmented {...rest} shape={shape ?? "round"} />;
}

