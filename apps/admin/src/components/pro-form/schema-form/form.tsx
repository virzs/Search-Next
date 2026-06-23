import { baseFormItemLayout } from "@/utils/utils";
import {
  BetaSchemaForm,
  ProFormColumnsType,
  ProFormInstance,
  ProFormProps,
} from "@ant-design/pro-components";
import { Space } from "antd";
import { useEffect, useRef, type RefObject } from "react";

export interface SchemaFormProps<
  T extends Record<string, any>,
  ValueType = "text"
> extends Omit<ProFormProps<T>, "action"> {
  formRef?: RefObject<ProFormInstance<T> | null>;
  columns: ProFormColumnsType<T, ValueType>[];
  dataSource?: T | null;
  setFieldsValueBefore?: (dataSource: T) => T;
}

const SchemaForm = <T extends Record<string, any>, ValueType = "text">(
  props: SchemaFormProps<T, ValueType>
) => {
  const {
    formRef: propsFormRef,
    dataSource,
    setFieldsValueBefore,
    ...rest
  } = props;

  const ref = useRef<ProFormInstance<T>>(null);

  const formRef = propsFormRef ?? ref;

  useEffect(() => {
    if (formRef.current && dataSource) {
      const fieldsValue = setFieldsValueBefore?.(dataSource) ?? dataSource;

      formRef.current.setFieldsValue(fieldsValue);
    }
  }, [dataSource, formRef]);

  return (
    <BetaSchemaForm<T, ValueType>
      layoutType="Form"
      submitter={{
        render: (_, dom) => (
          <Space className="w-full justify-center">{dom}</Space>
        ),
      }}
      formRef={formRef}
      {...baseFormItemLayout}
      {...rest}
    />
  );
};

export default SchemaForm;
