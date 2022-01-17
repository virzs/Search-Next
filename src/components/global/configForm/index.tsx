/*
 * @Author: Vir
 * @Date: 2022-01-14 16:19:11
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-17 14:27:33
 */
import React, { useEffect } from 'react';
import Form from '@/components/md-custom/form';
import { FieldValues, RegisterOptions, UseFormReturn } from 'react-hook-form';
import { TextField } from '@mui/material';

export type FormFieldType = 'text' | 'textArea';

export interface FormItemPropType {
  name: string;
  label: string;
  placeholder?: string;
  type: FormFieldType;
  required?: boolean;
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
}

export interface ConfigFormProps {
  value?: any;
  form: UseFormReturn<FieldValues, object>;
  config: FormItemPropType[];
}

const ConfigForm: React.FC<ConfigFormProps> = (props) => {
  const { config, value, form } = props;
  const { Item } = Form;
  const { reset } = form;

  useEffect(() => {
    value && reset(value);
  }, [value]);

  const renderField = (type: FormFieldType, props: any) => {
    switch (type) {
      case 'textArea':
        return (
          <TextField
            multiline
            rows={2}
            fullWidth
            variant="outlined"
            {...props}
          />
        );
      case 'text':
      default:
        return (
          <TextField
            fullWidth
            variant="outlined"
            {...props}
            {...props?.fieldProps}
          />
        );
    }
  };
  return (
    <Form form={form} size="small">
      {config.map(
        ({ type, placeholder, label, rules, required = false, ...i }, j) => {
          return (
            <Item
              label={label}
              rules={{
                required: { value: required, message: '请输入' + label },
                ...rules,
              }}
              {...i}
            >
              {renderField(type, {
                placeholder: placeholder ? placeholder : '请输入' + label,
              })}
            </Item>
          );
        },
      )}
    </Form>
  );
};

export default ConfigForm;
