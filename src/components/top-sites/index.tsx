/*
 * @Author: Vir
 * @Date: 2021-04-10 21:33:12
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-18 23:45:28
 */
import { ConnectStateType } from '@/models/connect';
import { Grid } from '@material-ui/core';
import React from 'react';
import { connect, ConnectProps, SiteListType } from 'umi';
import SiteDialog, { FormTypes, SiteDialogType } from './dialog';
import SiteCard from './siteCard';
import './styles/index.less';

export interface TopSitesPropType extends ConnectProps {
  list: SiteListType[];
}

const TopSites: React.FC<TopSitesPropType> = ({ list, dispatch }) => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [type, setType] = React.useState<SiteDialogType>('add');

  const addClick = () => {
    setType('add');
    setOpen(true);
  };

  const dialogClose = () => {
    setOpen(false);
  };

  const dialogSubmit = (val: FormTypes) => {
    console.log(val, 'dialog submit');
    if (dispatch)
      dispatch({
        type: 'sites/add',
        payload: {
          item: val,
        },
      });
  };

  React.useEffect(() => {
    console.log({ list, dispatch });
  }, [list]);

  return (
    <>
      <Grid
        className="top-sites"
        container
        alignContent="center"
        alignItems="center"
        justify="center"
      >
        <Grid item>
          <SiteCard type="add" onClick={addClick} />
        </Grid>
      </Grid>
      <SiteDialog
        open={open}
        type={type}
        onSubmit={dialogSubmit}
        onClose={dialogClose}
      />
    </>
  );
};

export default connect(({ sites }: ConnectStateType) => ({
  list: sites.list,
}))(TopSites);
