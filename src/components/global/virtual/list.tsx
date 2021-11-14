/*
 * @Author: Vir
 * @Date: 2021-11-14 22:34:15
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-14 22:47:42
 */
import { Overwrite } from '@/typings/global';
import React from 'react';
import { Virtuoso, VirtuosoProps } from 'react-virtuoso';

interface VirtualListBaseProps {
  datasource: any;
  itemRender: (item: any, index: number) => JSX.Element;
}

export interface VirtualListProps
  extends Overwrite<VirtuosoProps<any>, VirtualListBaseProps> {}

// 虚拟 List 组件
const VirtualList: React.FC<VirtualListProps> = ({
  datasource,
  itemRender,
  ...props
}) => {
  return (
    <Virtuoso
      data={datasource}
      itemContent={(index, item) => itemRender(item, index)}
    />
  );
};

export default VirtualList;
