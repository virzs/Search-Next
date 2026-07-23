import type { BackButtonProps } from "@/components/BackButton";
import FullPageContainer, {
  type FullPageContainerProps,
} from "./full";
import { Space } from "antd";
import { RiSaveLine } from "@remixicon/react";
import {
  Children,
  cloneElement,
  createContext,
  type FC,
  isValidElement,
  type ReactElement,
  type ReactNode,
  type RefObject,
  useContext,
  useState,
} from "react";
import { createPortal } from "react-dom";

interface FormPageApi {
  isFieldsTouched?: (allFields?: boolean) => boolean;
}

type FormPageApiSource =
  | FormPageApi
  | RefObject<FormPageApi | null | undefined>;

export interface FormPageContainerProps extends FullPageContainerProps {
  form: FormPageApiSource;
  hasUnsavedChanges?: () => boolean;
}

const FormPageActionsContext = createContext<HTMLElement | null>(null);

const resolveForm = (source: FormPageApiSource): FormPageApi | null => {
  if ("current" in source) {
    return source.current ?? null;
  }

  return source;
};

const FormPageContainer: FC<FormPageContainerProps> = (props) => {
  const {
    form,
    hasUnsavedChanges,
    cardProps,
    backButtonProps,
    children,
    ...rest
  } = props;
  const [actionsHost, setActionsHost] = useState<HTMLSpanElement | null>(null);
  const { extra, ...cardRest } = cardProps ?? {};

  const confirmUnsavedChanges: BackButtonProps["confirm"] = () =>
    hasUnsavedChanges?.() ??
    Boolean(resolveForm(form)?.isFieldsTouched?.());

  return (
    <FormPageActionsContext.Provider value={actionsHost}>
      <FullPageContainer
        {...rest}
        backButtonProps={{
          ...backButtonProps,
          confirm: backButtonProps?.confirm ?? confirmUnsavedChanges,
        }}
        cardProps={{
          ...cardRest,
          extra: (
            <Space wrap size={[8, 8]}>
              {extra}
              <span
                className="inline-flex flex-wrap items-center gap-2"
                ref={setActionsHost}
              />
            </Space>
          ),
        }}
      >
        {children}
      </FullPageContainer>
    </FormPageActionsContext.Provider>
  );
};

export interface FormPageActionsProps {
  children?: ReactNode;
}

export const FormPageActions: FC<FormPageActionsProps> = ({ children }) => {
  const host = useContext(FormPageActionsContext);
  const actions = Children.toArray(children);
  const submitAction = actions[actions.length - 1];

  if (!host || !submitAction) return null;

  const decoratedSubmitAction = isValidElement(submitAction)
    ? cloneElement(
        submitAction as ReactElement<{ icon?: ReactNode }>,
        {
          icon:
            (submitAction as ReactElement<{ icon?: ReactNode }>).props.icon ??
            <RiSaveLine size={16} />,
        },
      )
    : submitAction;

  return createPortal(decoratedSubmitAction, host);
};

export default FormPageContainer;
