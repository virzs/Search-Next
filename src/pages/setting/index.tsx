/*
 * @Author: Vir
 * @Date: 2021-06-10 11:08:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-16 14:54:14
 */

import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import React from 'react';
import allSetting from './allSetting';
import { SettingType } from './interface';
import './style.less';

const SettingPage: React.FC = () => {
  const [selected, setSelected] = React.useState<SettingType>(
    {} as SettingType,
  );

  React.useEffect(() => {
    const selected = allSetting.find((i) => i.component);
    if (selected) setSelected(selected);
  }, []);

  return (
    <div className="setting-page-root">
      <div className="setting-navigator-root">
        <Typography variant="h5">设置</Typography>
        <List dense>
          {allSetting.map((i) => (
            <div key={i.id}>
              {i.component && (
                <ListItem
                  button
                  selected={selected.id === i.id}
                  onClick={() => setSelected(i)}
                >
                  <ListItemIcon>{i.icon}</ListItemIcon>
                  <ListItemText primary={i.name} />
                </ListItem>
              )}
            </div>
          ))}
        </List>
      </div>
      <div className="setting-content-root">
        <div className="content-box">{selected.component}</div>
      </div>
    </div>
  );
};

export default SettingPage;
