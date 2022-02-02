/*
 * @Author: Vir
 * @Date: 2022-02-02 16:38:50
 * @Last Modified by: Vir
 * @Last Modified time: 2022-02-02 17:43:58
 */

import React from 'react';

export interface CardBaseProps {
  children: any;
}

export type StyleCardType = 'border' | 'shadow';

export interface StyleCardProps extends CardBaseProps {
  type?: StyleCardType;
}

export function BorderCard(props: CardBaseProps) {
  const { children } = props;

  return (
    <div className="bg-white rounded border hover:bg-gray-100 transition">
      {children}
    </div>
  );
}

export function ShadowCard(props: CardBaseProps) {
  return <div>ShadowCard</div>;
}

function StyleCard(props: StyleCardProps) {
  switch (props.type) {
    case 'border':
      return <BorderCard {...props} />;
  }
  return <div>Type is not optional</div>;
}

export default StyleCard;
