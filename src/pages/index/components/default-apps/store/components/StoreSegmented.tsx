import { Segmented } from "antd";
import type { SegmentedProps } from "antd";

export default function StoreSegmented<ValueType extends string | number = string>(props: SegmentedProps<ValueType>) {
  const { styles, shape, ...rest } = props;

  return <Segmented {...rest} shape={shape ?? "round"} />;
}
