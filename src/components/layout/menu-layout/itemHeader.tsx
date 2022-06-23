/*
 * @Author: Vir
 * @Date: 2021-09-20 22:34:20
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-20 17:27:35
 */

import React from 'react';

export interface ItemHeaderProps {
  title: string;
  desc?: string;
  titleLink?: string;
  descLink?: string;
  rightHandle?: React.ReactNode;
}

const ItemHeader: React.FC<ItemHeaderProps> = ({
  title,
  desc,
  titleLink,
  descLink,
  rightHandle,
}) => {
  return (
    <div className="py-2">
      <div className="font-semibold flex items-center justify-between">
        <p className="mb-0">
          {titleLink ? (
            <a href={titleLink} target="_blank">
              {title}
            </a>
          ) : (
            title
          )}
        </p>
        {rightHandle}
      </div>
      {desc && (
        <p className="mt-1 mb-0 text-sm text-gray-800">
          {descLink ? (
            <a href={descLink} target="_blank">
              {desc}
            </a>
          ) : (
            desc
          )}
        </p>
      )}
    </div>
  );
};

export default ItemHeader;
