/*
 * @Author: Vir
 * @Date: 2021-05-01 00:28:50
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-03 21:46:02
 */

import React from 'react';

export interface ConfirmPropsType {
  title: string;
  icon?: React.ReactNode;
  content?: string | React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

const confirm = (props: ConfirmPropsType) => {
  const div = document.createElement('div');
  document.body.append(div);
};

export default confirm;
