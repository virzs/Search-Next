/*
 * @Author: Vir
 * @Date: 2022-01-11 20:44:31
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-12 16:10:16
 */
import React from 'react';
import {
  Paper,
  Table as MTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableCellProps,
  styled,
  tableCellClasses,
} from '@mui/material';
import { Empty } from 'antd';

export interface Row {
  [x: string]: any;
}

export interface TableProps {
  size?: 'small' | 'medium';
  dataSource: Row[];
  columns: {
    name: string;
    field: string;
    align?: TableCellProps['align'];
    render?: (value: any, row: Row, index: number) => any;
  }[];
}

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.white,
    color: theme.palette.common.black,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const Table: React.FC<TableProps> = (props) => {
  const { dataSource, columns, size } = props;
  return (
    <TableContainer component={Paper}>
      <MTable sx={{ minWidth: 650 }} size={size}>
        <TableHead>
          <TableRow>
            {columns.map(({ name, field, align = 'left', ...i }) => (
              <StyledTableCell key={field} align={align}>
                {name}
              </StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {dataSource.map((row, index) => (
            <StyledTableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {columns.map(({ name, field, align = 'left', render, ...i }) => (
                <StyledTableCell key={field} align={align}>
                  {render ? render(row[field], row, index) : row[field]}
                </StyledTableCell>
              ))}
            </StyledTableRow>
          ))}
        </TableBody>
      </MTable>
      {dataSource.length === 0 && (
        <div className="w-full">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </TableContainer>
  );
};

export default Table;
