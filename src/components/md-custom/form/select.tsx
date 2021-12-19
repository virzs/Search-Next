/*
 * @Author: Vir
 * @Date: 2021-09-23 14:06:16
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-19 01:27:18
 */

import {
  alpha,
  styled,
  Box,
  FormControl,
  InputLabel,
  Select as MSelect,
  SelectChangeEvent,
  SelectProps as MSelectProps,
  createTheme,
} from '@material-ui/core';
import React from 'react';
import { MenuItem } from '../menu';

export interface SelectProps {
  value: any;
  label?: string;
  size?: 'small' | 'medium' | undefined;
  onChange?:
    | ((event: SelectChangeEvent<any>, child: React.ReactNode) => void)
    | undefined;
  // 选项
  options: { label: string; value: string | number; [x: string]: any }[];
  // 选项字段自定义
  optionsConfig?: { label: string; value: string };
}

const StyledSelect = styled((props: MSelectProps) => <MSelect {...props} />)(
  ({ theme }) => ({
    '& .MuiSelect-select': {},
  }),
);

const Select: React.FC<SelectProps> = ({
  value,
  label,
  size = 'medium',
  options,
  optionsConfig,
  onChange,
}) => {
  const theme = createTheme();

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id={`mui-select-label-${label}`}>{label}</InputLabel>
        <StyledSelect
          labelId={`mui-select-label-${label}`}
          id={`mui-select-${label}`}
          value={value}
          label={label}
          size={size}
          onChange={onChange}
          onClose={(e) => e.stopPropagation()}
          MenuProps={{
            sx: {
              '& .MuiPaper-root': {
                backgroundColor: 'rgba(253, 253, 253, 0.8)',
                backdropFilter: 'blur(8px)',
                borderRadius: '4px',
                marginTop: theme.spacing(1),
                minWidth: 140,
                color:
                  theme.palette.mode === 'light'
                    ? 'rgb(55, 65, 81)'
                    : theme.palette.grey[300],
                boxShadow:
                  'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
                '& .MuiMenu-list': {
                  padding: '0 4px',
                },
                '& .MuiMenuItem-root': {
                  borderRadius: '4px',
                  padding: '4px 8px',
                  margin: '4px 0',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  '& .MuiSvgIcon-root': {
                    fontSize: '14px',
                  },
                  '&:active': {
                    backgroundColor: alpha(
                      theme.palette.primary.main,
                      theme.palette.action.selectedOpacity,
                    ),
                  },
                },
              },
            },
          }}
        >
          {options.map((i) => {
            const label =
              optionsConfig && optionsConfig.label
                ? i[optionsConfig.label]
                : i.label;
            const value =
              optionsConfig && optionsConfig.value
                ? i[optionsConfig.value]
                : i.value;
            return (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            );
          })}
        </StyledSelect>
      </FormControl>
    </Box>
  );
};

export default Select;
