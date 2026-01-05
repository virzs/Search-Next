import { Segmented } from "antd";
import type { SegmentedProps } from "antd";
import type React from "react";

type StylesRecord = Record<string, React.CSSProperties | undefined>;

const mergeStylesRecord = (base: StylesRecord, incoming?: StylesRecord) => {
  if (!incoming) return base;
  const merged: StylesRecord = { ...base };
  for (const key of Object.keys(incoming)) {
    merged[key] = { ...(base[key] ?? {}), ...(incoming[key] ?? {}) };
  }
  return merged;
};

export default function StoreSegmented<ValueType extends string | number = string>(props: SegmentedProps<ValueType>) {
  const { styles, shape, ...rest } = props;

  const baseStyles: StylesRecord = {
    root: {
      background: "var(--store-bg-glass)",
      padding: 4,
    },
    item: {
      borderRadius: 9999,
    },
    label: {
      fontSize: 13,
    },
  };

  const mergedStyles =
    typeof styles === "function"
      ? (((info: any) => mergeStylesRecord(baseStyles, styles(info) as any)) as any)
      : (mergeStylesRecord(baseStyles, styles as any) as any);

  return <Segmented {...rest} shape={shape ?? "round"} styles={mergedStyles} />;
}
