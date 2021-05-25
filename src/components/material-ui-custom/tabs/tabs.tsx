/*
 * @Author: Vir
 * @Date: 2021-05-25 21:25:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-25 21:43:56
 */
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import TabPanel from './tabPane';

export interface TabsCustomPropsType {
  value: string | number;
  handleChange: (event: React.ChangeEvent<{}>, value: any) => void;
  tabs: string[];
  tabPanels?: any[] | undefined;
}

const TabsCustom: React.FC<TabsCustomPropsType> = ({
  value,
  handleChange,
  tabs,
  tabPanels,
}) => {
  const a11yProps = (index: number) => {
    return {
      id: `v-tab-${index}`,
      'aria-controls': `v-tabpanel-${index}`,
    };
  };
  return (
    <>
      <Tabs value={value} onChange={handleChange} aria-label="v tabs" centered>
        {tabs.map((i: string, j: number) => (
          <Tab label={i} {...a11yProps(j)} />
        ))}
      </Tabs>
      {tabPanels &&
        tabPanels.map((i: any, j: number) => (
          <TabPanel index={j} value={value}>
            {i}
          </TabPanel>
        ))}
    </>
  );
};

export default TabsCustom;
