/*
 * @Author: Vir
 * @Date: 2021-11-09 20:34:26
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-14 18:03:56
 */
import { Overwrite } from '@/typings/global';
import styled from '@emotion/styled';
import React from 'react';
import { GridListProps, VirtuosoGrid, VirtuosoGridProps } from 'react-virtuoso';

interface VirtualGridBaseProps {
  datasource: any;
  totalCount?: number;
}

export interface VirtualListProps
  extends Overwrite<VirtuosoGridProps, VirtualGridBaseProps> {}

// 虚拟 Grid 组件
const VirtualGrid: React.FC<VirtualListProps> = ({
  datasource = [],
  totalCount = 0,
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
      overscan={200}
      components={{
        Item: ItemContainer,
        List: ListContainer as React.ComponentType<GridListProps>,
        ScrollSeekPlaceholder: ({ height, width, index }) => (
          <ItemContainer>
            <ItemWrapper>{'--'}</ItemWrapper>
          </ItemContainer>
        ),
      }}
      itemContent={(index) => <ItemWrapper>Item {index}</ItemWrapper>}
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
