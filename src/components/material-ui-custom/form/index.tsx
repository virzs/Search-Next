/*
 * @Author: Vir
 * @Date: 2021-08-24 16:46:22
 * @Last Modified by: Vir
 * @Last Modified time: 2021-08-24 17:50:02
 */

import { useForm } from 'react-hook-form';
import PrivateFrom from './form';

import FormItem from './formItem';

type FormType = typeof PrivateFrom;

interface FormInterface extends FormType {
  Item: typeof FormItem;
  useForm: typeof useForm;
}

let Form = PrivateFrom as FormInterface;

Form.useForm = useForm;
Form.Item = FormItem;

export default Form;
