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
import Select from '@/components/md-custom/form/select';

export type FormFieldType = 'text' | 'textArea' | 'select';

export interface FormItemPropType {
  name: string;
  label: string;
  placeholder?: string;
  type: FormFieldType;
  required?: boolean;
  rules?: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
  fieldProps?: any;
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

  const PLACEHOLDER_TEXT = '请输入';
  const PLACEHOLDER_SELECT = '请选择';

  useEffect(() => {
    let filterValue: { [x: string]: any } = {};
    config
      .map((i) => i.name)
      .forEach((i) => {
        filterValue[i] = value[i];
      });
    value['id'] && (filterValue['id'] = value['id']);
    value['_id'] && (filterValue['_id'] = value['_id']);
    value && reset(filterValue);
  }, [value]);

  const renderField = (
    type: FormFieldType,
    props: any,
    { placeholder, label }: any,
  ) => {
    switch (type) {
      case 'select':
        return (
          <Select
            placeholder={placeholder ? placeholder : PLACEHOLDER_SELECT + label}
            label={label}
            {...props}
          />
        );
      case 'textArea':
        return (
          <TextField
            multiline
            rows={2}
            fullWidth
            variant="outlined"
            placeholder={placeholder ? placeholder : PLACEHOLDER_TEXT + label}
            {...props}
          />
        );
      case 'text':
      default:
        return (
          <TextField
            fullWidth
            variant="outlined"
            placeholder={placeholder ? placeholder : PLACEHOLDER_TEXT + label}
            {...props}
          />
        );
    }
  };
  return (
    <Form form={form} size="small">
      {config.map((item, j) => {
        const {
          type,
          placeholder,
          label,
          rules,
          required = false,
          fieldProps,
          ...i
        } = item;
        return (
          <Item
            key={i.name}
            label={label}
            rules={{
              required: { value: required, message: '请输入' + label },
              ...rules,
            }}
            {...i}
          >
            {renderField(
              type,
              {
                ...fieldProps,
              },
              item,
            )}
          </Item>
        );
      })}
    </Form>
  );
};

export default ConfigForm;
