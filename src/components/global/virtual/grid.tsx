/*
 * @Author: Vir
 * @Date: 2021-11-09 20:34:26
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-14 22:33:50
 */
import { Overwrite } from '@/typings/global';
import styled from '@emotion/styled';
import React from 'react';
import {
  GridItem,
  GridListProps,
  VirtuosoGrid,
  VirtuosoGridProps,
} from 'react-virtuoso';

interface VirtualGridBaseProps {
  datasource: any;
  totalCount?: number;
  itemRender: (item: any, index: number) => JSX.Element;
  itemContainer?: React.ComponentType<GridItem>;
  listContainer?: React.ComponentType<GridListProps>;
  placeholder?: JSX.Element;
}

export interface VirtualListProps
  extends Overwrite<VirtuosoGridProps, VirtualGridBaseProps> {}

// 虚拟 Grid 组件
const VirtualGrid: React.FC<VirtualListProps> = ({
  datasource = [],
  totalCount = 0,
  itemRender,
  itemContainer,
  listContainer,
  placeholder,
  overscan = 60,
  ...props
}) => {
  const ItemContainer = styled.div`
    padding: 0.5rem;
    width: 33%;
    display: flex;
    flex: none;
    align-content: stretch;

    @media (max-width: 1024px) {
      width: 50%;
    }

    @media (max-width: 480px) {
      width: 100%;
    }
  `;

  const ItemWrapper = styled.div`
    flex: 1;
    text-align: center;
    font-size: 80%;
    padding: 1rem 1rem;
    border: 1px solid var(--ifm-hr-border-color);
    white-space: nowrap;
  `;

  const ListContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
  `;

  return (
    <VirtuosoGrid
      totalCount={totalCount ? totalCount : datasource.length}
      overscan={overscan}
      components={{
        Item: itemContainer ? itemContainer : ItemContainer,
        List: listContainer
          ? listContainer
          : (ListContainer as React.ComponentType<GridListProps>),
        ScrollSeekPlaceholder: ({ height, width, index }) => (
          <ItemContainer>
            <ItemWrapper>
              {placeholder ? placeholder : 'Loading...'}
            </ItemWrapper>
          </ItemContainer>
        ),
      }}
      itemContent={(index) => (
        <ItemWrapper>{itemRender(datasource[index], index)}</ItemWrapper>
      )}
      scrollSeekConfiguration={{
        enter: (velocity) => Math.abs(velocity) > 200,
        exit: (velocity) => Math.abs(velocity) < 30,
        change: (_, range) => console.log({ range }),
      }}
      {...props}
    />
  );
};

export default VirtualGrid;
