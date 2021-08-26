/*
 * @Author: Vir
 * @Date: 2021-05-01 00:28:50
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-03 21:46:02
 */

import React from 'react';
import ReactDOM from 'react-dom';
import DialogConfirm, { confirmType } from './DialogConfirm';

export interface ConfirmPropsType {
  title: string;
  icon?: React.ReactNode;
  content?: string;
  type?: confirmType;
  okText?: string;
  cancelText?: string;
  onOk?: () => void;
  onCancel?: () => void;
}

class Modal {
  dom: HTMLDivElement | undefined;

  constructor() {}

  confirm(props: ConfirmPropsType) {
    const {
      title,
      content,
      type = 'info',
      okText,
      cancelText,
      onOk,
      onCancel,
    } = props;

    this.dom = document.createElement('div');

    const dialog = (
      <DialogConfirm
        open={true}
        container={this.dom}
        title={title}
        content={content}
        type={type}
        okText={okText}
        cancelText={cancelText}
        onOk={() => this.onOk(onOk)}
        onCancel={() => this.onCancel(onCancel)}
      />
    );

    ReactDOM.render(dialog, this.dom);

    document.body.append(this.dom);
  }
  onCancel(onCancel?: () => void) {
    onCancel instanceof Function && onCancel();
    this.close();
  }

  onOk(onOk?: () => void) {
    onOk instanceof Function && onOk();
    this.close();
  }

  close() {
    this.dom?.setAttribute(
      'style',
      'opacity:0;transition: opacity 225ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;',
    );
    setTimeout(() => {
      this.dom && this.dom.remove();
    }, 226);
  }
}

export default new Modal();
