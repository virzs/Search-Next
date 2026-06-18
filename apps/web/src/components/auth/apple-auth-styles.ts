import { css } from "@emotion/css";

export const appleAuthPanelClassName = css`
  color: #1d1d1f;

  .apple-auth-copy {
    margin-bottom: 18px;
    text-align: center;
  }

  .apple-auth-title {
    font-size: 24px;
    font-weight: 750;
    line-height: 1.15;
    letter-spacing: 0;
    color: #1d1d1f;
  }

  .apple-auth-description {
    margin-top: 8px;
    font-size: 13px;
    line-height: 20px;
    color: #6e6e73;
  }

  .apple-auth-segmented {
    margin-bottom: 20px;
    font-size: 13px;
  }

  .apple-auth-alert.ant-alert {
    border-radius: 14px;
    background: rgba(255, 204, 0, 0.13);
    border-color: rgba(255, 204, 0, 0.28);
  }

  .apple-auth-switch-row {
    margin-top: 18px;
    text-align: center;
    font-size: 13px;
    line-height: 20px;
    color: #6e6e73;
  }

  .apple-auth-switch-row button {
    margin-left: 6px;
    border: 0;
    background: transparent;
    color: #007aff;
    font-weight: 700;
  }

  .apple-auth-switch-row button:focus-visible {
    border-radius: 8px;
    outline: 3px solid rgba(0, 122, 255, 0.16);
    outline-offset: 2px;
  }
`;

export const appleAuthFormClassName = css`
  .ant-form {
    display: grid;
    gap: 15px;
  }

  .ant-form-item {
    margin-bottom: 0 !important;
  }

  .ant-form-item-label {
    padding-bottom: 6px;
  }

  .ant-form-item-label > label {
    height: auto;
    color: #3a3a3c;
    font-size: 12px;
    font-weight: 750;
    line-height: 18px;
  }

  .ant-form-item-label > label::after {
    display: none;
  }

  .ant-input,
  .ant-input-affix-wrapper {
    border-color: rgba(60, 60, 67, 0.16) !important;
    border-radius: 12px !important;
    background: rgba(242, 242, 247, 0.72) !important;
    box-shadow: none !important;
    color: #1d1d1f;
    font-size: 14px;
  }

  .ant-input {
    height: 44px;
    padding: 0 12px;
  }

  .ant-input-affix-wrapper {
    min-height: 44px;
    padding: 0 12px;
  }

  .ant-input-affix-wrapper .ant-input {
    height: auto;
    border: 0 !important;
    background: transparent !important;
    padding: 0;
  }

  .ant-input::placeholder,
  .ant-input-affix-wrapper .ant-input::placeholder {
    color: rgba(60, 60, 67, 0.42);
  }

  .ant-input:hover,
  .ant-input-affix-wrapper:hover {
    border-color: rgba(0, 122, 255, 0.42) !important;
    background: rgba(255, 255, 255, 0.96) !important;
  }

  .ant-input:focus,
  .ant-input-focused,
  .ant-input-affix-wrapper-focused {
    border-color: #007aff !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 4px rgba(0, 122, 255, 0.13) !important;
  }

  .ant-form-item-has-error .ant-input,
  .ant-form-item-has-error .ant-input-affix-wrapper {
    border-color: rgba(255, 59, 48, 0.7) !important;
    background: #ffffff !important;
    box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.08) !important;
  }

  .ant-form-item-explain {
    min-height: 18px;
    margin-top: 4px;
  }

  .ant-form-item-explain-error {
    color: #ff3b30;
    font-size: 12px;
    line-height: 18px;
  }

  .apple-auth-field-icon {
    color: #8e8e93;
  }

  .apple-auth-form-options {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: -1px 0 2px;
  }

  .ant-checkbox-wrapper {
    color: #6e6e73;
    font-size: 13px;
  }

  .ant-checkbox .ant-checkbox-inner {
    border-color: rgba(60, 60, 67, 0.22);
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.86);
  }

  .ant-checkbox-wrapper:hover .ant-checkbox-inner,
  .ant-checkbox:hover .ant-checkbox-inner {
    border-color: #007aff !important;
  }

  .ant-checkbox-checked .ant-checkbox-inner {
    border-color: #007aff !important;
    background: #007aff !important;
  }

  .apple-auth-link {
    color: #007aff !important;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
  }

  .apple-auth-link:hover {
    color: #0a84ff !important;
  }

  .apple-auth-icon-button.ant-btn {
    display: grid;
    min-width: 24px !important;
    width: 24px !important;
    height: 24px !important;
    place-items: center;
    border: 0 !important;
    border-radius: 8px !important;
    color: #8e8e93 !important;
  }

  .apple-auth-icon-button.ant-btn:hover {
    background: rgba(0, 122, 255, 0.08) !important;
    color: #007aff !important;
  }

  .apple-auth-primary-button.ant-btn {
    height: 44px !important;
    border: 0 !important;
    border-radius: 999px !important;
    background: #007aff !important;
    box-shadow: 0 10px 24px rgba(0, 122, 255, 0.22) !important;
    color: #ffffff !important;
    font-weight: 750;
  }

  .apple-auth-primary-button.ant-btn:hover,
  .apple-auth-primary-button.ant-btn:focus {
    background: #0a84ff !important;
    color: #ffffff !important;
  }

  .apple-auth-primary-button.ant-btn:active {
    background: #006edb !important;
  }

  .apple-auth-primary-button.ant-btn:disabled {
    background: rgba(0, 122, 255, 0.42) !important;
    color: rgba(255, 255, 255, 0.78) !important;
  }

  .apple-auth-captcha-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 112px;
    gap: 8px;
  }

  .apple-auth-code-button.ant-btn {
    height: 44px !important;
    border-color: rgba(60, 60, 67, 0.16) !important;
    border-radius: 12px !important;
    background: rgba(255, 255, 255, 0.78) !important;
    color: #007aff !important;
    font-size: 13px;
    font-weight: 750;
    box-shadow: none !important;
  }

  .apple-auth-code-button.ant-btn:hover,
  .apple-auth-code-button.ant-btn:focus {
    border-color: rgba(0, 122, 255, 0.35) !important;
    background: #ffffff !important;
    color: #007aff !important;
  }

  .apple-auth-code-button.ant-btn:disabled {
    border-color: rgba(60, 60, 67, 0.1) !important;
    background: rgba(242, 242, 247, 0.72) !important;
    color: #8e8e93 !important;
  }

  .apple-auth-terms {
    margin-top: 15px;
    text-align: center;
  }

  .apple-auth-terms .ant-typography {
    color: #6e6e73;
    font-size: 12px;
    line-height: 18px;
  }

  @media (max-width: 520px) {
    .apple-auth-form-options {
      align-items: flex-start;
      flex-direction: column;
    }

    .apple-auth-captcha-row {
      grid-template-columns: 1fr;
    }
  }
`;

export const appleAccountInfoClassName = css`
  display: flex;
  min-height: 0;
  flex-direction: column;
  gap: 14px;

  .apple-account-card {
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.82);
    border-radius: 22px;
    background: rgba(255, 255, 255, 0.84);
    box-shadow:
      0 1px 2px rgba(0, 0, 0, 0.05),
      inset 0 1px 0 rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(18px);
  }

  .apple-account-header {
    display: grid;
    grid-template-columns: 84px minmax(0, 1fr) auto;
    align-items: center;
    gap: 16px;
    padding: 18px;
  }

  .apple-account-avatar.ant-avatar {
    box-shadow:
      0 10px 24px rgba(0, 0, 0, 0.12),
      inset 0 1px 0 rgba(255, 255, 255, 0.42);
  }

  .apple-account-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #1d1d1f;
    font-size: 24px;
    font-weight: 800;
    line-height: 30px;
  }

  .apple-account-email {
    overflow: hidden;
    margin-top: 3px;
    color: #6e6e73;
    font-size: 13px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .apple-account-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    margin-top: 10px;
    border-radius: 999px;
    background: #f2f2f7;
    padding: 5px 9px;
    color: #6e6e73;
    font-size: 12px;
    font-weight: 750;
  }

  .apple-account-logout.ant-btn {
    height: 34px;
    border: 1px solid rgba(255, 59, 48, 0.18) !important;
    border-radius: 999px;
    background: rgba(255, 59, 48, 0.07) !important;
    color: #ff3b30 !important;
    font-size: 13px;
    font-weight: 750;
    box-shadow: none !important;
  }

  .apple-account-logout.ant-btn:hover,
  .apple-account-logout.ant-btn:focus {
    border-color: rgba(255, 59, 48, 0.3) !important;
    background: rgba(255, 59, 48, 0.1) !important;
    color: #ff3b30 !important;
  }

  .apple-account-meta-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    border-top: 1px solid rgba(60, 60, 67, 0.1);
    padding: 14px 18px 18px;
  }

  .apple-account-meta {
    min-width: 0;
    border-radius: 14px;
    background: rgba(242, 242, 247, 0.82);
    padding: 12px;
  }

  .apple-account-meta-label {
    color: #6e6e73;
    font-size: 11px;
    font-weight: 800;
    line-height: 16px;
  }

  .apple-account-meta-value {
    overflow: hidden;
    margin-top: 4px;
    color: #1d1d1f;
    font-size: 13px;
    font-weight: 750;
    line-height: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  @media (max-width: 560px) {
    .apple-account-header {
      grid-template-columns: 72px minmax(0, 1fr);
    }

    .apple-account-avatar.ant-avatar {
      width: 72px !important;
      height: 72px !important;
      line-height: 72px !important;
    }

    .apple-account-logout.ant-btn {
      grid-column: 1 / -1;
      justify-self: start;
    }

    .apple-account-meta-grid {
      grid-template-columns: 1fr;
    }
  }
`;
