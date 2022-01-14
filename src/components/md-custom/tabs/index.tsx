/*
 * @Author: Vir
 * @Date: 2022-01-12 16:10:29
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-12 17:37:27
 */
import {
  Box,
  Button,
  styled,
  Tab,
  Tabs as MTabs,
  Typography,
} from '@mui/material';
import React from 'react';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  noPadding?: boolean;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, noPadding = false, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: noPadding ? 0 : 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

export interface TabConfig {
  label: string;
  value: string | number;
  panel: any;
}

export interface TabsProps {
  tabs: TabConfig[];
  noPadding?: boolean;
  orientation?: 'vertical' | 'horizontal';
}

const Tabs: React.FC<TabsProps> = (props) => {
  const { tabs, noPadding, orientation = 'horizontal' } = props;

  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box>
      <MTabs
        orientation={orientation}
        variant="scrollable"
        value={value}
        onChange={handleChange}
      >
        {tabs.map((i, j) => (
          <Tab label={i.label} {...a11yProps(j)} />
        ))}
      </MTabs>
      {tabs.map((i, j) => (
        <TabPanel value={value} noPadding={noPadding} index={j}>
          {i.panel}
        </TabPanel>
      ))}
    </Box>
  );
};

export default Tabs;
