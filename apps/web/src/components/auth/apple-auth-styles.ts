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
    border-radius: var(--sn-radius-surface);
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

  [data-theme="dark"] & {
    color: #f5f5f7;
  }

  [data-theme="dark"] & .apple-auth-title {
    color: #f5f5f7;
  }

  [data-theme="dark"] & .apple-auth-description,
  [data-theme="dark"] & .apple-auth-switch-row {
    color: #aeaeb2;
  }
`;

export const appleAuthFormClassName = css`
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

  .apple-auth-link {
    color: var(--auth-accent, #0a84ff) !important;
    font-size: 13px;
    font-weight: 700;
    text-decoration: none;
  }

  .apple-auth-link:hover {
    color: color-mix(in srgb, var(--auth-accent, #0a84ff) 84%, white) !important;
  }

  .legal-agreement-link {
    margin-inline: 4px;
    padding: 0;
    border: 0;
    border-radius: var(--sn-radius-compact);
    background: transparent;
    cursor: pointer;
    font-family: inherit;
    line-height: inherit;
  }

  .legal-agreement-link:focus-visible {
    outline: 2px solid var(--auth-accent, #0a84ff);
    outline-offset: 2px;
  }

  .apple-auth-captcha-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
  }

  .apple-auth-captcha-row .sn-button {
    justify-self: start;
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

  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus {
    -webkit-text-fill-color: #1d1d1f !important;
    box-shadow: 0 0 0 1000px #f2f2f7 inset !important;
    caret-color: #1d1d1f;
  }

  [data-theme="dark"] & .apple-auth-field-icon {
    color: #8e8e93 !important;
  }

  [data-theme="dark"] & .apple-auth-terms .ant-typography {
    color: #aeaeb2;
  }

  [data-theme="dark"] & input:-webkit-autofill,
  [data-theme="dark"] & input:-webkit-autofill:hover,
  [data-theme="dark"] & input:-webkit-autofill:focus {
    -webkit-text-fill-color: #f5f5f7 !important;
    box-shadow: 0 0 0 1000px #2c2c2e inset !important;
    caret-color: #f5f5f7;
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
  --account-card-surface: var(--sn-surface, rgba(255, 255, 255, 0.84));
  --account-card-text: var(--sn-text, #1d1d1f);
  --account-card-text-secondary: var(--sn-text-secondary, #6e6e73);
  --account-card-separator: var(--sn-separator, rgba(60, 60, 67, 0.12));
  --account-card-shadow: var(--sn-shadow, 0 1px 2px rgba(0, 0, 0, 0.05));
  --account-card-avatar-ring: var(--sn-surface-strong, #ffffff);
  --account-card-action-surface: rgba(255, 255, 255, 0.62);
  --account-card-action-surface-hover: rgba(255, 255, 255, 0.9);
  --account-card-action-border: rgba(255, 255, 255, 0.34);
  --account-card-action-text: #5f5f64;
  --account-card-action-text-hover: #c9342c;
  display: flex;
  min-height: 0;
  flex-direction: column;

  .apple-account-card {
    position: relative;
    isolation: isolate;
    overflow: hidden;
    border: 1px solid var(--account-card-separator);
    border-radius: var(--sn-radius-surface);
    background: var(--account-card-surface);
    box-shadow:
      var(--account-card-shadow),
      0 12px 32px rgba(31, 35, 48, 0.055);
  }

  .apple-account-cover {
    position: relative;
    min-height: 120px;
    background-color: #5e5ce6;
    background-position: center;
    background-size: cover;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.28);
  }

  .apple-account-cover::before,
  .apple-account-cover::after {
    position: absolute;
    pointer-events: none;
    content: "";
  }

  .apple-account-cover::before {
    inset: 0;
    background:
      radial-gradient(
        circle at 14% -45%,
        rgba(255, 255, 255, 0.62),
        transparent 52%
      ),
      linear-gradient(
        115deg,
        rgba(255, 255, 255, 0.12),
        transparent 46%,
        rgba(0, 0, 0, 0.08)
      );
  }

  .apple-account-cover::after {
    right: 0;
    bottom: 0;
    left: 0;
    height: 38px;
    background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.12));
  }

  .apple-account-cover .apple-account-logout.sn-button {
    position: absolute;
    z-index: 1;
    top: 14px;
    right: 14px;
    height: 30px;
    min-height: 30px;
    border-radius: var(--sn-radius-round);
    padding-inline: 12px;
    font-size: 12px;
    font-weight: 600;
    border-color: var(--account-card-action-border);
    background: var(--account-card-action-surface);
    color: var(--account-card-action-text);
    box-shadow:
      0 1px 4px rgba(0, 0, 0, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.42);
    backdrop-filter: blur(16px) saturate(150%);
    -webkit-backdrop-filter: blur(16px) saturate(150%);
  }

  .apple-account-cover .apple-account-logout.sn-button:hover,
  .apple-account-cover .apple-account-logout.sn-button:focus-visible,
  .apple-account-cover .apple-account-logout.sn-button:active {
    border-color: rgba(255, 59, 48, 0.3);
    background: var(--account-card-action-surface-hover);
    color: var(--account-card-action-text-hover);
  }

  .apple-account-profile {
    display: grid;
    grid-template-columns: 88px minmax(0, 1fr);
    align-items: start;
    gap: 18px;
    padding: 0 20px 20px;
  }

  .apple-account-avatar.ant-avatar {
    position: relative;
    z-index: 1;
    margin-top: -38px;
    border: 4px solid var(--account-card-avatar-ring);
    background: var(--account-card-avatar-ring);
    box-shadow:
      0 8px 20px rgba(22, 24, 35, 0.16),
      0 1px 2px rgba(22, 24, 35, 0.08);
  }

  .apple-account-identity {
    min-width: 0;
    padding-top: 13px;
  }

  .apple-account-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--account-card-text);
    font-size: 24px;
    font-weight: 800;
    line-height: 30px;
  }

  .apple-account-email {
    overflow: hidden;
    margin-top: 4px;
    color: var(--account-card-text-secondary);
    font-size: 13px;
    line-height: 20px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .apple-account-meta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-top: 9px;
  }

  .apple-account-joined {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--account-card-text-secondary);
    font-size: 12px;
    font-weight: 650;
    line-height: 20px;
    white-space: nowrap;
  }

  [data-theme="dark"] & {
    --account-card-surface: var(--sn-surface, rgba(255, 255, 255, 0.08));
    --account-card-text: var(--sn-text, #f5f5f7);
    --account-card-text-secondary: var(--sn-text-secondary, #aeaeb2);
    --account-card-separator: var(
      --sn-separator,
      rgba(235, 235, 245, 0.12)
    );
    --account-card-shadow: var(--sn-shadow, 0 1px 2px rgba(0, 0, 0, 0.24));
    --account-card-avatar-ring: var(--sn-surface-strong, #242426);
    --account-card-action-surface: rgba(28, 28, 30, 0.42);
    --account-card-action-surface-hover: rgba(44, 44, 46, 0.82);
    --account-card-action-border: rgba(255, 255, 255, 0.18);
    --account-card-action-text: rgba(242, 242, 247, 0.9);

    .apple-account-card {
      box-shadow:
        var(--account-card-shadow),
        0 16px 36px rgba(0, 0, 0, 0.18);
    }
  }

  @media (max-width: 560px) {
    .apple-account-cover {
      min-height: 96px;
    }

    .apple-account-cover .apple-account-logout.sn-button {
      top: 12px;
      right: 12px;
    }

    .apple-account-profile {
      grid-template-columns: 72px minmax(0, 1fr);
      gap: 14px;
      padding: 0 16px 16px;
    }

    .apple-account-avatar.ant-avatar {
      width: 72px !important;
      height: 72px !important;
      margin-top: -30px;
      border-width: 3px;
      line-height: 72px !important;
    }

    .apple-account-identity {
      padding-top: 11px;
    }

    .apple-account-name {
      font-size: 21px;
      line-height: 27px;
    }
  }

  @media (prefers-reduced-transparency: reduce) {
    --account-card-surface: var(--sn-surface-strong, #ffffff);
    --account-card-action-surface: #f2f2f7;
    --account-card-action-surface-hover: #ffffff;

    .apple-account-cover .apple-account-logout.sn-button {
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }

    [data-theme="dark"] & {
      --account-card-surface: var(--sn-surface-strong, #242426);
      --account-card-action-surface: #3a3a3c;
      --account-card-action-surface-hover: #ffffff;
    }
  }

  @media (prefers-contrast: more) {
    .apple-account-card,
    .apple-account-cover .apple-account-logout.sn-button {
      border-width: 2px;
    }
  }
`;
