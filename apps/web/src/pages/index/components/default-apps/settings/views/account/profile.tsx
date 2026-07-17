import { App, Button, Form, Input, Skeleton } from "antd";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { useI18n } from "@/i18n";
import { updateMyProfile } from "@/services/user";
import {
  MacSettingsSection,
  MacSettingsView,
} from "../../components/macos-settings";
import { settingsRoute } from "../../route-paths";
import { accountSettingsPanelClassName } from "./styles";

interface ProfileFormValues {
  username: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || !error) return fallback;
  const requestError = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return requestError.response?.data?.message || requestError.message || fallback;
};

const ProfileSettingsView = () => {
  const { t } = useI18n();
  const { message } = App.useApp();
  const { user, loading, isAuthenticated, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm<ProfileFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(settingsRoute.path.account, { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (form as any).setFieldsValue({ username: user.username });
    setDirty(false);
  }, [form, user]);

  const handleSubmit = async ({ username }: ProfileFormValues) => {
    if (!user || submitting) return;
    setSubmitting(true);
    try {
      const updated = await updateMyProfile(username.trim());
      updateUser(updated);
      (form as any).setFieldsValue({ username: updated.username });
      setDirty(false);
      message.success(t("ui.account.profileUpdated"));
    } catch (error) {
      message.error(
        getErrorMessage(error, t("ui.account.profileUpdateFailed")),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MacSettingsView
      navigationTitle={t("ui.account.editProfile")}
      showPageHeader={false}
    >
      {loading || !user ? (
        <div className="rounded-[14px] bg-[var(--sn-surface)] p-5" aria-busy="true">
          <Skeleton active paragraph={{ rows: 5 }} />
        </div>
      ) : (
        <MacSettingsSection>
          <div className={accountSettingsPanelClassName}>
            <p className="account-settings-intro">
              {t("ui.account.profileDescription")}
            </p>

            <Form
              form={form}
              layout="vertical"
              requiredMark={false}
              onFinish={handleSubmit}
              onValuesChange={(_, values) => {
                setDirty(values.username?.trim() !== user.username);
              }}
            >
              <Form.Item
                label={t("ui.username")}
                name="username"
                extra={t("ui.account.usernameHelp")}
                rules={[
                  { required: true, message: t("ui.enterAUsername") },
                  {
                    min: 2,
                    max: 20,
                    message: t("ui.usernameMustBe220Characters"),
                  },
                  {
                    pattern: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
                    message: t("ui.auth.usernamePattern"),
                  },
                ]}
              >
                <Input autoComplete="username" maxLength={20} />
              </Form.Item>

              <div className="account-settings-actions">
                <Button
                  className="account-settings-action account-settings-action-primary"
                  htmlType="submit"
                  shape="round"
                  loading={submitting}
                  disabled={!dirty}
                >
                  {t("ui.account.saveProfile")}
                </Button>
              </div>
            </Form>
          </div>
        </MacSettingsSection>
      )}
    </MacSettingsView>
  );
};

export default ProfileSettingsView;
