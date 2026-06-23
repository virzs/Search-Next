import { Tree as AntdTree, TreeProps as AntdTreeProps } from "antd";
import { DataNode } from "antd/es/tree";
import { FC, useMemo } from "react";

export interface TreeProps extends AntdTreeProps {
  valueEnum?: DataNode[];
  value?: string[];
  fieldProps?: {
    onChange?: (value: string[]) => void;
  };
}

const Tree: FC<TreeProps> = (props) => {
  const { valueEnum, value, fieldProps, ...rest } = props;
  const { onChange } = fieldProps ?? {};

  const treeData = useMemo(() => {
    if (!valueEnum) return [];
    // 递归将 name，_id 转为 title，key
    const recursion = (data: DataNode[]): DataNode[] => {
      return data.map((item: any) => {
        const { name, _id, children } = item;
        return {
          title: name,
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
