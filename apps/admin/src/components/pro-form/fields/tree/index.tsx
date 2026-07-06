import { Space, Tag, Tree as AntdTree, TreeProps as AntdTreeProps } from "antd";
import { DataNode } from "antd/es/tree";
import { FC, useMemo } from "react";

export interface TreeProps extends AntdTreeProps {
  valueEnum?: DataNode[];
  value?: string[];
  fieldProps?: {
    onChange?: (value: string[]) => void;
    showPermissionStatus?: boolean;
  };
}

const Tree: FC<TreeProps> = (props) => {
  const { valueEnum, value, fieldProps, ...rest } = props;
  const { onChange, showPermissionStatus } = fieldProps ?? {};

  const treeData = useMemo(() => {
    if (!valueEnum) return [];
    // 递归将 name，_id 转为 title，key
    const recursion = (data: DataNode[]): DataNode[] => {
      return data.map((item: any) => {
        const { name, _id, children, source, isStale } = item;
        return {
          title: showPermissionStatus ? (
            <Space size={4} style={{ maxWidth: "100%" }}>
              <span
                title={name}
                style={{
                  display: "inline-block",
                  maxWidth: 220,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  verticalAlign: "bottom",
                  whiteSpace: "nowrap",
                }}
              >
                {name}
              </span>
              <Tag color={source === "auto" ? "blue" : "default"}>{source === "auto" ? "自动" : "手动"}</Tag>
              {isStale ? <Tag color="orange">已失效</Tag> : null}
            </Space>
          ) : (
            name
          ),
          key: _id,
          children: children && recursion(children),
        };
      });
    };

    return recursion(valueEnum || []);
  }, [valueEnum]);

  return (
    <AntdTree
      treeData={treeData}
      checkable
      checkedKeys={value}
      onCheck={onChange as any}
      {...rest}
    />
  );
};

export default Tree;
