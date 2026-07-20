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

  .account-settings-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 18px;
  }

  .account-settings-final-field.ant-form-item {
    margin-bottom: 0;
  }

  @media (max-width: 640px) {
    padding: 17px;

    .account-settings-actions .sn-button {
      width: 100%;
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

  @media (max-width: 640px) {
    padding: 17px;

    .danger-zone-content {
      align-items: stretch;
      flex-direction: column;
    }
  }
`;

export const deleteAccountModalClassName = css`
  --delete-modal-text: #1d1d1f;
  --delete-modal-text-secondary: #6e6e73;
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

  .delete-account-confirmation-field.ant-form-item {
    margin-bottom: 0;
  }

  .delete-account-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
  }

  [data-theme="dark"] & {
    --delete-modal-text: #f5f5f7;
    --delete-modal-text-secondary: #aeaeb2;
  }

  @media (max-width: 640px) {
    .delete-account-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  }
`;
