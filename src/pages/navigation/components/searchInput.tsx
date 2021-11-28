/*
 * @Author: Vir
 * @Date: 2021-11-27 17:45:11
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-27 17:46:35
 */
import { Paper, IconButton, InputBase } from '@material-ui/core';
import { Menu, Search } from '@material-ui/icons';
import React from 'react';

function SearchInput() {
  return (
    <Paper
      component="form"
      sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: 400 }}
    >
      <IconButton sx={{ p: '10px' }} aria-label="menu">
        <Menu />
      </IconButton>
      <InputBase
        sx={{ ml: 1, flex: 1 }}
        placeholder="Search Google Maps"
        inputProps={{ 'aria-label': 'search google maps' }}
      />
      <IconButton type="submit" sx={{ p: '10px' }} aria-label="search">
        <Search />
      </IconButton>
    </Paper>
  );
}

export default SearchInput;
