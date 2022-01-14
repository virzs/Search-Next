/*
 * @Author: Vir
 * @Date: 2022-01-11 14:40:46
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-11 17:56:19
 */
import { createTheme, ThemeProvider } from '@mui/material';
import {
  DataGrid,
  gridClasses,
  GridColumns,
  GridToolbarContainer,
  GridToolbarExport,
  zhCN,
} from '@mui/x-data-grid';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';

export interface PageinationConfig {
  current: number;
  pageSize: number;
  pageSizeOptions: number[];
}

export interface TableProps {
  dataSource: readonly {
    [key: string]: any;
  }[];
  columns: GridColumns;
  height?: number;
  disableSelectionOnClick?: boolean;
  exportBtn?: boolean;
  pagination?: true;
  pageinationConfig?: PageinationConfig;
}

const Table: React.FC<TableProps> = (props) => {
  const {
    dataSource,
    columns,
    height = 300,
    disableSelectionOnClick = true,
    exportBtn = false,
    pagination,
    pageinationConfig,
  } = props;
  const [pageConfig, setPageConfig] = useState({
    current: 1,
    pageSize: 10,
    pageSizeOptions: [10, 20, 40],
  } as PageinationConfig);

  const theme = createTheme(
    {
      palette: {
        primary: { main: '#1976d2' },
      },
    },
    zhCN,
  );

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer className={gridClasses.toolbarContainer}>
        {exportBtn && <GridToolbarExport />}
      </GridToolbarContainer>
    );
  };

  useEffect(() => {
    if (pageinationConfig) setPageConfig(pageinationConfig);
  }, [pageinationConfig]);

  return (
    <div style={{ height }}>
      <div style={{ display: 'flex', height: '100%' }}>
        <div style={{ flexGrow: 1 }}>
          <ThemeProvider theme={theme}>
            <DataGrid
              disableSelectionOnClick={disableSelectionOnClick}
              rows={dataSource}
              columns={columns}
              components={{
                Toolbar: CustomToolbar,
              }}
            />
          </ThemeProvider>
        </div>
      </div>
    </div>
  );
};

export default Table;
