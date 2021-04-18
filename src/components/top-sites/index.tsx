/*
 * @Author: Vir
 * @Date: 2021-04-10 21:33:12
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-11 15:10:44
 */
import { Grid } from '@material-ui/core';
import React from 'react';
import SiteDialog, { FormTypes, SiteDialogType } from './dialog';
import SiteCard from './siteCard';
import './styles/index.less';

export interface TopSitesPropTypes {}

const TopSites: React.FC = () => {
  const [open, setOpen] = React.useState<boolean>(false);
  const [type, setType] = React.useState<SiteDialogType>('add');

  const addClick = () => {
    setType('add');
    setOpen(true);
  };

  const dialogClose = () => {
    setOpen(false);
  };

  const dialogSubmit = (val: FormTypes) => {};

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

export default TopSites;
