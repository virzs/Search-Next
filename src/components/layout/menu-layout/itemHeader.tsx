/*
 * @Author: Vir
 * @Date: 2021-09-20 22:34:20
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-20 22:39:17
 */

import React from 'react';

export interface ItemHeaderProps {
  title: string;
  desc?: string;
  rightHandle?: React.ReactNode;
}

const ItemHeader: React.FC<ItemHeaderProps> = ({
  title,
  desc,
  rightHandle,
}) => {
  return (
    <div className="py-2">
      <div className="font-semibold flex items-center justify-between">
        <p className="mb-0">{title}</p>
        {rightHandle}
      </div>
      {desc && <p className="mt-1 mb-0 text-sm text-gray-800">{desc}</p>}
    </div>
  );
};

export default ItemHeader;
