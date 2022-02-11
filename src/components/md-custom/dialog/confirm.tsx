/*
 * @Author: Vir
 * @Date: 2021-05-01 00:28:50
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-19 22:11:17
 */

import React from 'react';
import ReactDOM from 'react-dom';
import DialogConfirm, { confirmType } from './dialogConfirm';

export interface ConfirmProps {
  title: string;
  icon?: React.ReactNode;
  content?: string | React.ReactNode;
  type?: confirmType | false;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
  showFooter?: boolean;
}

const confirm = (props: ConfirmProps) => {
  const {
    title,
    content,
    type = 'info',
    okText,
    cancelText,
    onOk,
    onCancel,
    ...rest
  } = props;

  const div = document.createElement('div');

  const close = () => {
    div.setAttribute(
      'style',
      'opacity:0;transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
    );
    setTimeout(() => {
      div && div.remove();
    }, 226);
  };

  const privateOnCancel = (onCancel?: () => void) => {
    onCancel instanceof Function && onCancel();
    close();
  };

  const privateOnOk = (onOk?: () => void) => {
    onOk instanceof Function && onOk();
    close();
  };

  const dialog = (
    <DialogConfirm
      open={true}
      title={title}
      content={content}
      type={type}
      okText={okText}
      cancelText={cancelText}
      onOk={() => privateOnOk(onOk)}
      onCancel={() => privateOnCancel(onCancel)}
      container={div}
      {...rest}
    />
  );

  ReactDOM.render(dialog, div);

  document.body.append(div);
};
export default confirm;
