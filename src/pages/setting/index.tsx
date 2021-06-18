/*
 * @Author: Vir
 * @Date: 2021-06-10 11:08:48
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-18 15:58:59
 */

import {
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { ArrowBack } from '@material-ui/icons';
import React from 'react';
import { history, useIntl } from 'umi';
import allSetting from './allSetting';
import { SettingType } from './interface';
import './style.less';

export type SettingRouteState = { search?: string } | null | undefined;

const SettingPage: React.FC = () => {
  const { formatMessage } = useIntl();

  const [selected, setSelected] = React.useState<SettingType>(
    {} as SettingType,
  );

  React.useEffect(() => {
    // init state
    const selected = allSetting.find((i) => i.component);
    const state: SettingRouteState = history.location?.state;
    if (selected) setSelected(selected);
    if (state?.search && selected) {
      const sel = allSetting.find((i) => i.id === state?.search);
      setSelected(sel ? sel : selected);
    }
  }, []);

  return (
    <div className="setting-page-root">
      <div className="setting-navigator-root">
        <Typography variant="h5">
          <IconButton
            size="small"
            onClick={() => {
              history.goBack();
            }}
          >
            <ArrowBack />
          </IconButton>
          {formatMessage({ id: 'app.page.setting.title' })}
        </Typography>
        <List dense>
          {allSetting.map((i) => (
            <div key={i.id}>
              {i.component && (
                <ListItem
                  button
                  selected={selected.id === i.id}
                  onClick={() => {
                    setSelected(i);
                    history.replace('/setting', { search: i.id });
                  }}
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
