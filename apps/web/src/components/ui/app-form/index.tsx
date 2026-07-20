import { Form } from "antd";
import type { FormProps } from "antd";
import { cx } from "@emotion/css";

export type AppFormDensity = "compact" | "default" | "relaxed";

export interface AppFormProps<Values = any> extends FormProps<Values> {
  density?: AppFormDensity;
}

const AppFormRoot = <Values,>({
  density = "default",
  className,
  ...props
}: AppFormProps<Values>) => (
  <Form
    {...props}
    className={cx("sn-form", `sn-form--${density}`, className)}
    data-form-density={density}
  />
);

const AppForm = Object.assign(AppFormRoot, {
  ErrorList: Form.ErrorList,
  Item: Form.Item,
  List: Form.List,
  Provider: Form.Provider,
  useForm: Form.useForm,
  useFormInstance: Form.useFormInstance,
  useWatch: Form.useWatch,
});

export default AppForm;

