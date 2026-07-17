import { css } from "@emotion/css";

export const accountSettingsPanelClassName = css`
  padding: 20px;

  .account-settings-heading {
    margin-bottom: 18px;
  }

  .account-settings-heading h2 {
    margin: 0;
    color: var(--sn-text);
    font-size: 16px;
    font-weight: 700;
    line-height: 22px;
    letter-spacing: -0.01em;
  }

  .account-settings-heading p {
    margin: 3px 0 0;
    color: var(--sn-text-secondary);
    font-size: 12px;
    line-height: 18px;
  }

  .account-settings-intro {
    margin: 0 0 18px;
    color: var(--sn-text-secondary);
    font-size: 12px;
    line-height: 18px;
  }

  .ant-form-item-label > label {
    color: var(--sn-text) !important;
    font-size: 13px;
    font-weight: 650;
  }

  .ant-form-item-extra {
    color: var(--sn-text-tertiary);
    font-size: 11px;
    line-height: 17px;
  }

  .account-settings-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;
  }

  .account-settings-final-field.ant-form-item {
    margin-bottom: 0;
  }

  .account-settings-action.ant-btn {
    height: 36px;
    min-width: 128px;
    border-radius: 999px;
    padding-inline: 20px;
    font-weight: 650;
    box-shadow: none !important;
    transition:
      color 140ms ease-out,
      border-color 140ms ease-out,
      background-color 140ms ease-out;
  }

  .account-settings-action-primary.ant-btn:not(:disabled) {
    color: var(--sn-accent);
    border-color: color-mix(in srgb, var(--sn-accent) 72%, transparent);
    background: transparent;
  }

  .account-settings-action-primary.ant-btn:not(:disabled):hover,
  .account-settings-action-primary.ant-btn:not(:disabled):focus-visible,
  .account-settings-action-primary.ant-btn:not(:disabled):active {
    color: var(--sn-accent);
    border-color: var(--sn-accent);
    background: color-mix(in srgb, var(--sn-accent) 8%, transparent);
  }

  .account-settings-action.ant-btn:disabled,
  .account-settings-action.ant-btn.ant-btn-disabled {
    opacity: 1;
    color: var(--sn-text-secondary) !important;
    border-color: color-mix(in srgb, var(--sn-text) 24%, transparent) !important;
    background: color-mix(in srgb, var(--sn-text) 8%, transparent) !important;
  }

  .account-settings-action.ant-btn:hover,
  .account-settings-action.ant-btn:focus-visible,
  .account-settings-action.ant-btn:active {
    box-shadow: none !important;
  }

  @media (max-width: 640px) {
    padding: 17px;

    .account-settings-action.ant-btn {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-settings-action.ant-btn {
      transition: none;
    }
  }

  @media (prefers-contrast: more) {
    .ant-input,
    .ant-input-affix-wrapper {
      border-color: currentColor;
    }
  }
`;

export const dangerZoneClassName = css`
  padding: 20px;

  .danger-zone-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  h2 {
    margin: 0;
    color: var(--sn-text);
    font-size: 14px;
    font-weight: 700;
    line-height: 20px;
  }

  p {
    max-width: 480px;
    margin: 4px 0 0;
    color: var(--sn-text-secondary);
    font-size: 12px;
    line-height: 18px;
  }

  .account-settings-action.ant-btn {
    height: 36px;
    min-width: 128px;
    border-radius: 999px;
    padding-inline: 20px;
    font-weight: 650;
    box-shadow: none !important;
    transition:
      color 140ms ease-out,
      border-color 140ms ease-out,
      background-color 140ms ease-out;
  }

  .account-settings-action.ant-btn:hover,
  .account-settings-action.ant-btn:focus-visible,
  .account-settings-action.ant-btn:active {
    box-shadow: none !important;
  }

  @media (max-width: 640px) {
    padding: 17px;

    .danger-zone-content {
      align-items: stretch;
      flex-direction: column;
    }

    .account-settings-action.ant-btn {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .account-settings-action.ant-btn {
      transition: none;
    }
  }
`;

export const deleteAccountModalClassName = css`
  --delete-modal-text: #1d1d1f;
  --delete-modal-text-secondary: #6e6e73;
  --delete-modal-text-tertiary: #8e8e93;
  --delete-modal-surface-secondary: rgba(118, 118, 128, 0.09);
  --delete-modal-separator: rgba(60, 60, 67, 0.16);
  color: var(--delete-modal-text);

  .delete-account-warning {
    margin: 0 0 18px;
    color: var(--delete-modal-text-secondary);
    font-size: 13px;
    line-height: 20px;
  }

  .delete-account-warning strong {
    color: var(--delete-modal-text);
    font-weight: 750;
  }

  .ant-form-item-label > label {
    color: var(--delete-modal-text);
    font-size: 13px;
    font-weight: 650;
  }

  .ant-input,
  .ant-input-affix-wrapper {
    border-color: var(--delete-modal-separator);
    background: var(--delete-modal-surface-secondary);
    color: var(--delete-modal-text);
    box-shadow: none;
  }

  .ant-input-affix-wrapper .ant-input {
    background: transparent;
  }

  .ant-input::placeholder,
  .ant-input-affix-wrapper .ant-input::placeholder,
  .ant-input-password-icon {
    color: var(--delete-modal-text-tertiary);
  }

  .ant-input:hover,
  .ant-input-affix-wrapper:hover {
    border-color: color-mix(
      in srgb,
      var(--delete-modal-text) 34%,
      transparent
    );
  }

  .ant-input:focus,
  .ant-input-focused,
  .ant-input-affix-wrapper-focused {
    border-color: var(--delete-modal-accent);
    box-shadow: 0 0 0 2px
      color-mix(in srgb, var(--delete-modal-accent) 18%, transparent);
  }

  .ant-form-item-explain-error {
    color: #ff453a;
  }

  .delete-account-confirmation-field.ant-form-item {
    margin-bottom: 0;
  }

  .delete-account-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
  }

  .delete-account-actions .ant-btn {
    height: 36px;
    min-width: 104px;
    border-radius: 999px;
    padding-inline: 18px;
    font-weight: 650;
    box-shadow: none !important;
  }

  .delete-account-actions .ant-btn-default {
    border-color: var(--delete-modal-separator);
    background: transparent;
    color: var(--delete-modal-text);
  }

  .delete-account-actions .ant-btn-default:not(:disabled):hover,
  .delete-account-actions .ant-btn-default:not(:disabled):focus-visible {
    border-color: color-mix(
      in srgb,
      var(--delete-modal-text) 34%,
      transparent
    );
    background: var(--delete-modal-surface-secondary);
    color: var(--delete-modal-text);
  }

  .delete-account-actions
    .ant-btn-dangerous.ant-btn-primary:not(:disabled) {
    border-color: #ff3b30;
    background: #ff3b30;
    color: #fff;
  }

  .delete-account-actions
    .ant-btn-dangerous.ant-btn-primary:not(:disabled):hover,
  .delete-account-actions
    .ant-btn-dangerous.ant-btn-primary:not(:disabled):focus-visible {
    border-color: #ff453a;
    background: #ff453a;
    color: #fff;
  }

  .delete-account-actions .ant-btn:disabled,
  .delete-account-actions .ant-btn.ant-btn-disabled {
    opacity: 1;
    border-color: color-mix(
      in srgb,
      var(--delete-modal-text) 18%,
      transparent
    ) !important;
    background: color-mix(
      in srgb,
      var(--delete-modal-text) 7%,
      transparent
    ) !important;
    color: var(--delete-modal-text-tertiary) !important;
  }

  [data-theme="dark"] & {
    --delete-modal-text: #f5f5f7;
    --delete-modal-text-secondary: #aeaeb2;
    --delete-modal-text-tertiary: #8e8e93;
    --delete-modal-surface-secondary: rgba(255, 255, 255, 0.08);
    --delete-modal-separator: rgba(235, 235, 245, 0.16);
  }

  @media (max-width: 640px) {
    .delete-account-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }

    .delete-account-actions .ant-btn {
      width: 100%;
      min-width: 0;
      margin-inline-start: 0 !important;
    }
  }

  @media (prefers-contrast: more) {
    .ant-input,
    .ant-input-affix-wrapper {
      border-width: 2px;
    }
  }
`;
