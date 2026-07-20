import { Segmented } from "antd";
import type { SegmentedProps } from "antd";
import { css, cx } from "@emotion/css";
import type { CSSProperties } from "react";

export default function AppSegmented<ValueType extends string | number = string>(
  props: SegmentedProps<ValueType>,
) {
  const { shape, classNames, styles, ...rest } = props;
  const mergedShape = shape ?? "default";
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
  borderRadius: "var(--sn-radius-control)",
  background: "rgba(118, 118, 128, 0.14)",
  padding: 3,
};

const appSegmentedItemStyle: CSSProperties = {
  borderRadius: "var(--sn-radius-control)",
  fontSize: 12,
  fontWeight: 700,
};

const appSegmentedItemClassName = css`
  color: rgba(60, 60, 67, 0.74);

  &.ant-segmented-item-selected {
    background: #ffffff;
    color: #1d1d1f;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.14);
  }

  [data-theme="dark"] .ant-segmented & {
    color: rgba(235, 235, 245, 0.68);
  }

  [data-theme="dark"] .ant-segmented &:hover {
    color: #f5f5f7;
  }

  [data-theme="dark"] .ant-segmented &.ant-segmented-item-selected {
    background: rgba(255, 255, 255, 0.18);
    color: #ffffff;
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.12),
      0 1px 3px rgba(0, 0, 0, 0.28);
  }

  [data-theme="dark"] .ant-segmented
    &.ant-segmented-item-selected
    .ant-segmented-item-label {
    color: #ffffff;
  }
`;
