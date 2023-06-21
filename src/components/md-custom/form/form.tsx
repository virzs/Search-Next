/*
 * @Author: Vir
 * @Date: 2021-08-22 22:06:08
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-31 20:12:09
 */

import React from 'react';
import { FieldValues, RegisterOptions, UseFormReturn } from 'react-hook-form';

export interface FormItemProps {
  name: string;
  type: 'input' | 'select';
  rules: Omit<RegisterOptions, 'valueAsNumber' | 'valueAsDate' | 'setValueAs'>;
}

export interface FormProps<T> {
  id?: string;
  items?: FormItemProps[];
  form: UseFormReturn<T>;
  size?: 'small' | 'medium';
  children: any;
}

function Form<T>(props: FormProps<T>) {
  const { id, form, size, children } = props;

  const [items, setItems] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (children instanceof Object && !children.length) {
      setItems([
        React.cloneElement(children, {
          control: form.control,
          size,
          key: 'form-item',
        }),
      ]);
      return;
    } else if (children instanceof Array && children.length) {
      setItems(
        children.map((i, j) => (
          <React.Fragment key={j}>
            {React.cloneElement(i, {
              control: form.control,
              size,
              key: j,
            })}
          </React.Fragment>
        )),
      );
      return;
    }
    throw new Error('Children must be object or array');
  }, [children]);

  return (
    <form id={id} style={{ overflow: 'hidden' }}>
      {items}
    </form>
  );
}

export default Form;
