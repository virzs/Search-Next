/*
 * @Author: Vir
 * @Date: 2021-06-12 21:28:28
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-31 14:07:44
 */

import React from 'react';

export interface HeaderProps {
  title: string;
  icon?: JSX.Element;
  action?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({ title, action, icon }) => {
  return (
    <div className="pt-8 pb-4 font-semibold">
      <div className="flex items-center justify-between">
        <div className="flex justify-start items-center text-xl">
          {icon && (
            <div className="mr-2 flex items-center justify-center">{icon}</div>
          )}
          {title}
        </div>
        {action && <div>{action}</div>}
      </div>
    </div>
  );
};

export default Header;
