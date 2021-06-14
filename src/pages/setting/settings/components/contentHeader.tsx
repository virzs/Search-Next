/*
 * @Author: Vir
 * @Date: 2021-06-12 21:28:28
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-12 21:32:31
 */

import { Typography } from '@material-ui/core';

export interface ContentHeaderProps {
  title: string;
}

const ContentHeader: React.FC<ContentHeaderProps> = ({ title }) => {
  return (
    <div className="content-header-root">
      <Typography variant="h6">{title}</Typography>
    </div>
  );
};

export default ContentHeader;
