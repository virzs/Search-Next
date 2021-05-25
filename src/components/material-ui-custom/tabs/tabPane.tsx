/*
 * @Author: Vir
 * @Date: 2021-05-25 21:26:03
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-25 21:46:07
 */

import { Box, Typography } from '@material-ui/core';
import React, { ReactNode } from 'react';

export interface TabPanePropsType {
  children: ReactNode;
  value: number | string;
  index: number;
}

const TabPanel: React.FC<TabPanePropsType> = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`v-tabpanel-${index}`}
      aria-labelledby={`v-tab-${index}`}
      {...other}
    >
      {value === index && <Typography>{children}</Typography>}
    </div>
  );
};

export default TabPanel;
