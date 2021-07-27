/*
 * @Author: Vir
 * @Date: 2021-06-12 21:28:28
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-12 21:32:31
 */

import { Typography } from '@material-ui/core';
import classNames from 'classnames';
import { ContentHeaderStyle } from './style';

export interface ContentHeaderProps {
  title: string;
  icon?: JSX.Element;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ title, icon }) => {
  return (
    <div className={classNames(ContentHeaderStyle())}>
      <Typography variant="h6" className="content-header">
        {icon && <div className="header-icon">{icon}</div>}
        {title}
      </Typography>
    </div>
  );
};

export default ContentHeader;
