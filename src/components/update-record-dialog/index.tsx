/*
 * @Author: Vir
 * @Date: 2021-03-29 16:26:44
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-25 22:18:12
 */

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { githubCommitTypes } from '@/utils/common';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import './style/index.less';
import TabsCustom from '../material-ui-custom/tabs/tabs';
import CommitPage from './commits';

export interface UpdateRecordDialogPropTypes {
  open: boolean;
  onClose: () => void;
}

export interface CommitValueTypes {
  author: {
    name: string;
    date: string;
    avatar_url: string;
    html_url: string;
  };
  desc: string;
  type: githubCommitTypes;
  message: string;
  url: string;
}

export interface CommitSourceValueTypes {
  commit: { author: { [x: string]: any; email: any }; message: string };
  author: { avatar_url: any; html_url: any };
  html_url: any;
}

export const UpdateRecordDialog: React.FC<UpdateRecordDialogPropTypes> = ({
  open,
  onClose,
  ...props
}) => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = React.useState<number>(0);

  // dialog滚动事件
  const contentScroll = (e: { target: any }) => {
    let el = e.target;
    let isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1; // 修正误差
    if (isBottom && !loading) {
      setLoading(true);
    }
  };

  // dialog关闭
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      className="update-record-dialog"
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="scroll-dialog-title">
        {formatMessage({ id: 'app.component.uploadrecorddialog.title' })}
        {onClose ? (
          <IconButton
            className="dialog-close"
            aria-label="close"
            onClick={onClose}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        ) : null}
      </DialogTitle>
      <DialogContent
        className="dialog-content"
        dividers
        onScroll={contentScroll}
      >
        <TabsCustom
          value={activeTab}
          handleChange={(_, tab) => {
            setActiveTab(tab);
          }}
          tabs={['更新记录', '历史版本']}
          tabPanels={[
            <CommitPage
              loading={loading}
              onAfterLoading={() => setLoading(false)}
            />,
          ]}
        />
      </DialogContent>
    </Dialog>
  );
};
