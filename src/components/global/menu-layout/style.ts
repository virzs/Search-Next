/*
 * @Author: Vir
 * @Date: 2021-07-25 00:25:51
 * @Last Modified by: Vir
 * @Last Modified time: 2021-07-25 11:22:28
 */

import { css } from '@emotion/css';

export const MenuLayoutRootStyle = () => {
  return css`
    background-color: rgba(247, 247, 247);
    height: 100%;
    display: flex;
  `;
};

export const MenuLayoutSideStyle = () => {
  return css`
    width: 340px;
    height: 100%;
    padding: 30px 25px 0 50px;
    border-right: 1px solid #c3c3c3;
    .MuiListItemIcon-root {
      min-width: 32px;
    }
    .MuiTypography-h5 {
      display: flex;
      align-items: center;
    }
  `;
};

export const MenuLayoutContentStyle = () => {
  return css`
    width: calc(100% - 340px);
    padding: 0px 25px 0px 50px;
    height: 100%;
    overflow-y: auto;
    scroll-behavior: smooth;
  `;
};

export const MenuLayoutContentBoxStyle = () => {
  return css`
    max-width: 820px;
  `;
};

export const MenuLayoutContentHeaderStyle = () => {
  return css`
    padding-top: 34px;
    padding-bottom: 16px;
    > * {
      font-weight: 600;
    }
  `;
};

export const ContentHeaderStyle = () => {
  return css`
    padding-top: 34px;
    padding-bottom: 16px;
    > * {
      font-weight: 600 !important;
    }
    .content-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      .header-icon {
        margin-right: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  `;
};

export const ContentItemTitleStyle = css`
  padding: 10px 0;
  overflow: auto;
  overflow-wrap: break-word;
  > p {
    margin-bottom: 0;
  }
  .item-title {
    font-weight: 600;
    font-size: 14px;
    line-height: 20px;
    color: #262626;
    display: flex;
    align-items: center;
    justify-content: space-between;
    p {
      margin-bottom: 0;
    }
  }
  .item-title-desc {
    margin-top: 4px;
    margin-bottom: 0px;
    font-size: 12px;
    line-height: 16px;
    color: #717171;
  }
`;
