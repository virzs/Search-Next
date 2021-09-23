/*
 * @Author: Vir
 * @Date: 2021-09-23 14:06:16
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-23 14:28:45
 */

import {
  Box,
  FormControl,
  InputLabel,
  Select as MSelect,
  MenuItem,
  SelectChangeEvent,
} from '@material-ui/core';
import React from 'react';

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

const Select: React.FC<SelectProps> = ({
  value,
  label,
  size = 'medium',
  options,
  optionsConfig,
  onChange,
}) => {
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth>
        <InputLabel id={`mui-select-label-${label}`}>{label}</InputLabel>
        <MSelect
          labelId={`mui-select-label-${label}`}
          id={`mui-select-${label}`}
          value={value}
          label={label}
          size={size}
          onChange={onChange}
          onClose={(e) => e.stopPropagation()}
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
        </MSelect>
      </FormControl>
    </Box>
  );
};

export default Select;
