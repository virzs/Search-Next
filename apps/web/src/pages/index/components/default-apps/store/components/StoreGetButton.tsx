import { AppButton, type AppButtonProps } from "@/components/ui";

export type StoreGetButtonProps = Omit<
  AppButtonProps,
  "block" | "intent" | "size"
>;

const StoreGetButton = (props: StoreGetButtonProps) => (
  <AppButton {...props} intent="primary" size="small" />
);

export default StoreGetButton;
