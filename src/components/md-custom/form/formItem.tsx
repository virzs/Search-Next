/*
 * @Author: Vir
 * @Date: 2021-08-22 22:25:13
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-24 17:26:45
 */

import React from 'react';
import {
  Control,
  Controller,
  FieldValues,
  RegisterOptions,
} from 'react-hook-form';

export interface FormItemProps {
  name: string;
  label?: string;
  size?: 'small' | 'medium';
  control?: Control<FieldValues>;
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  children: JSX.Element;
  defaultValue?: any;
}

const FormItem: React.FC<FormItemProps> = (props) => {
  const {
    name,
    children,
    size,
    rules,
    defaultValue = '',
    label,
    control,
  } = props;

  return (
    <div style={{ padding: '6px 0' }}>
      <Controller
        name={name}
        control={control}
        rules={rules}
        defaultValue={defaultValue}
        render={({
          field: { onChange: controllerOnChange, ...field },
          fieldState: { error },
        }) =>
          React.cloneElement(children, {
            onChange: (e: any) => {
              if (children.props.onChange) children.props.onChange(e);
              controllerOnChange(e);
            },
            label,
            size,
            ...field,
            error: !!error,
            helperText: error ? error.message : '',
          })
        }
      />
    </div>
  );
};

export default FormItem;
