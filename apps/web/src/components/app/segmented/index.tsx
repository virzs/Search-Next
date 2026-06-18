import { Segmented } from "antd";
import type { SegmentedProps } from "antd";
import { css, cx } from "@emotion/css";
import type { CSSProperties } from "react";

export default function AppSegmented<ValueType extends string | number = string>(
  props: SegmentedProps<ValueType>,
) {
  const { shape, classNames, styles, ...rest } = props;
  const mergedShape = shape ?? "round";
  const semanticInfo = {
    props: {
      ...props,
      shape: mergedShape,
    },
  };
  const resolvedClassNames =
    typeof classNames === "function"
      ? (classNames as any)(semanticInfo)
      : classNames;
  const resolvedStyles =
    typeof styles === "function" ? (styles as any)(semanticInfo) : styles;

  return (
    <Segmented
      {...rest}
      shape={mergedShape}
      classNames={{
        ...resolvedClassNames,
        item: cx(appSegmentedItemClassName, resolvedClassNames?.item),
      }}
      styles={{
        ...resolvedStyles,
        root: {
          ...appSegmentedRootStyle,
          ...resolvedStyles?.root,
        },
        item: {
          ...appSegmentedItemStyle,
          ...resolvedStyles?.item,
        },
      }}
    />
  );
}

const appSegmentedRootStyle: CSSProperties = {
  borderRadius: 999,
  background: "rgba(118, 118, 128, 0.14)",
  padding: 3,
};

const appSegmentedItemStyle: CSSProperties = {
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};

const appSegmentedItemClassName = css`
  &.ant-segmented-item-selected {
    background: #ffffff;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.14);
  }
`;
