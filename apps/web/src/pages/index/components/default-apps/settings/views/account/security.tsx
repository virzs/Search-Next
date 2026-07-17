import { RiEyeLine, RiEyeOffLine } from "@remixicon/react";
import {
  App,
  Button,
  Form,
  Input,
  Skeleton,
  theme as antdTheme,
  type InputRef,
} from "antd";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router";
import {
  DesktopNextBaseModal,
  desktopNextThemeDark,
  desktopNextThemeLight,
} from "zs_library";
import { useAuth } from "@/hooks/useAuth";
import useDesktopTheme from "@/hooks/useDesktopTheme";
import { useI18n } from "@/i18n";
import { changeMyPassword, deleteMyAccount } from "@/services/user";
import { accountRoute } from "../../../account/route-paths";
import {
  MacSettingsSection,
  MacSettingsView,
} from "../../components/macos-settings";
import { settingsRoute } from "../../route-paths";
import {
  accountSettingsPanelClassName,
  dangerZoneClassName,
  deleteAccountModalClassName,
} from "./styles";

interface PasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface DeleteFormValues {
  currentPassword: string;
  confirmation: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (typeof error !== "object" || !error) return fallback;
  const requestError = error as {
    message?: string;
    response?: { data?: { message?: string } };
  };
  return requestError.response?.data?.message || requestError.message || fallback;
};

const SecuritySettingsView = () => {
  const { t } = useI18n();
  const { message } = App.useApp();
  const { token } = antdTheme.useToken();
  const { resolvedColorScheme } = useDesktopTheme();
  const { user, loading, isAuthenticated, clearSession } = useAuth();
  const navigate = useNavigate();
  const [passwordForm] = Form.useForm<PasswordFormValues>();
  const [deleteForm] = Form.useForm<DeleteFormValues>();
  const deletePasswordRef = useRef<InputRef>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const deletePassword = Form.useWatch("currentPassword", deleteForm);
  const deleteConfirmation = Form.useWatch("confirmation", deleteForm);
  const canDelete = Boolean(
    user && deletePassword && deleteConfirmation === user.username,
  );
  const deleteModalTheme =
    resolvedColorScheme === "dark"
      ? desktopNextThemeDark
      : desktopNextThemeLight;
  const deleteModalStyle = {
    "--delete-modal-accent": token.colorPrimary,
  } as CSSProperties;

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate(settingsRoute.path.account, { replace: true });
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (!deleteOpen) return;
    const frame = requestAnimationFrame(() => {
      deletePasswordRef.current?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [deleteOpen]);

  const finishSession = (successMessage: string) => {
    message.success(successMessage);
    clearSession();
    navigate(accountRoute.path.login, { replace: true });
  };

  const handlePasswordSubmit = async (values: PasswordFormValues) => {
    if (changingPassword) return;
    setChangingPassword(true);
    try {
      await changeMyPassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      finishSession(t("ui.account.passwordChanged"));
    } catch (error) {
      message.error(
        getErrorMessage(error, t("ui.account.passwordChangeFailed")),
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteSubmit = async (values: DeleteFormValues) => {
    if (deleting) return;
    setDeleting(true);
    try {
      await deleteMyAccount(values);
      setDeleteOpen(false);
      (deleteForm as any).resetFields();
      finishSession(t("ui.account.deleted"));
    } catch (error) {
      message.error(getErrorMessage(error, t("ui.account.deleteFailed")));
    } finally {
      setDeleting(false);
    }
  };

  const openDeleteModal = () => {
    (deleteForm as any).resetFields();
    setDeleteOpen(true);
  };

  const passwordVisibilityIcon = (visible: boolean) => (
    <span
      role="img"
      aria-label={t(
        visible ? "ui.account.hidePassword" : "ui.account.showPassword",
      )}
    >
      {visible ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
    </span>
  );

  if (loading || !user) {
    return (
      <MacSettingsView showPageHeader={false}>
        <div className="rounded-[14px] bg-[var(--sn-surface)] p-5" aria-busy="true">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      </MacSettingsView>
    );
  }

  return (
    <MacSettingsView
      navigationTitle={t("ui.signInAndSecurity")}
      showPageHeader={false}
    >
      <MacSettingsSection>
        <div className={accountSettingsPanelClassName}>
          <div className="account-settings-heading">
            <div>
              <h2>{t("ui.account.changePassword")}</h2>
              <p>{t("ui.account.passwordDescription")}</p>
            </div>
          </div>

          <Form
            form={passwordForm}
            layout="vertical"
            requiredMark={false}
            onFinish={handlePasswordSubmit}
          >
            <Form.Item
              label={t("ui.account.currentPassword")}
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: t("ui.account.enterCurrentPassword"),
                },
              ]}
            >
              <Input.Password
                placeholder={t("ui.account.enterCurrentPassword")}
                autoComplete="current-password"
                iconRender={passwordVisibilityIcon}
              />
            </Form.Item>

            <Form.Item
              label={t("ui.account.newPassword")}
              name="newPassword"
              extra={t("ui.account.passwordHelp")}
              rules={[
                { required: true, message: t("ui.account.enterNewPassword") },
                {
                  min: 6,
                  max: 20,
                  message: t("ui.account.passwordLength"),
                },
                {
                  pattern: /^(?=.*[a-zA-Z])(?=.*\d)/,
                  message: t("ui.passwordMustIncludeLettersAndNumbers"),
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value !== getFieldValue("currentPassword")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t("ui.account.passwordMustDiffer")),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder={t("ui.account.enterNewPassword")}
                autoComplete="new-password"
                iconRender={passwordVisibilityIcon}
              />
            </Form.Item>

            <Form.Item
              className="account-settings-final-field"
              label={t("ui.confirmPassword")}
              name="confirmPassword"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: t("ui.confirmYourPassword") },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || value === getFieldValue("newPassword")) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t("ui.theTwoPasswordsDoNotMatch")),
                    );
                  },
                }),
              ]}
            >
              <Input.Password
                placeholder={t("ui.confirmYourPassword")}
                autoComplete="new-password"
                iconRender={passwordVisibilityIcon}
              />
            </Form.Item>

            <div className="account-settings-actions">
              <Button
                className="account-settings-action account-settings-action-primary"
                htmlType="submit"
                shape="round"
                loading={changingPassword}
              >
                {t("ui.account.updatePassword")}
              </Button>
            </div>
          </Form>
        </div>
      </MacSettingsSection>

      <MacSettingsSection title={t("ui.account.dangerZone")}>
        <div className={dangerZoneClassName}>
          <div className="danger-zone-content">
            <div>
              <h2>{t("ui.account.deleteAccount")}</h2>
              <p>{t("ui.account.deleteAccountDescription")}</p>
            </div>
            <Button
              className="account-settings-action"
              danger
              shape="round"
              onClick={openDeleteModal}
            >
              {t("ui.account.deleteAccount")}
            </Button>
          </div>
        </div>
      </MacSettingsSection>

      <DesktopNextBaseModal
        visible={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        width={480}
        destroyOnClose
        theme={deleteModalTheme}
        title={t("ui.account.deleteConfirmTitle")}
        floatingControls={{
          close: !deleting,
          fullscreen: false,
        }}
      >
        <div
          className={deleteAccountModalClassName}
          style={deleteModalStyle}
        >
          <p
            id="delete-account-description"
            className="delete-account-warning"
          >
            {t("ui.account.deleteConfirmDescription")} {" "}
            <strong>{user.username}</strong>
          </p>
          <Form
            className="delete-account-form"
            form={deleteForm}
            layout="vertical"
            requiredMark={false}
            onFinish={handleDeleteSubmit}
            aria-describedby="delete-account-description"
          >
            <Form.Item
              label={t("ui.account.currentPassword")}
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: t("ui.account.enterCurrentPassword"),
                },
              ]}
            >
              <Input.Password
                ref={deletePasswordRef}
                placeholder={t("ui.account.enterCurrentPassword")}
                autoComplete="current-password"
                iconRender={passwordVisibilityIcon}
              />
            </Form.Item>
            <Form.Item
              className="delete-account-confirmation-field"
              label={t("ui.account.confirmUsername")}
              name="confirmation"
              rules={[
                {
                  required: true,
                  message: t("ui.account.enterUsernameToConfirm"),
                },
                {
                  validator(_, value) {
                    if (!value || value === user.username) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error(t("ui.account.usernameConfirmationMismatch")),
                    );
                  },
                },
              ]}
            >
              <Input
                placeholder={t("ui.account.enterUsernameToConfirm")}
                autoComplete="off"
              />
            </Form.Item>
            <div className="delete-account-actions">
              <Button
                shape="round"
                disabled={deleting}
                onClick={() => setDeleteOpen(false)}
              >
                {t("ui.cancel")}
              </Button>
              <Button
                danger
                type="primary"
                shape="round"
                htmlType="submit"
                loading={deleting}
                disabled={!canDelete}
              >
                {t("ui.account.deletePermanently")}
              </Button>
            </div>
          </Form>
        </div>
      </DesktopNextBaseModal>
    </MacSettingsView>
  );
};

export default SecuritySettingsView;
