/*
 * @Author: Vir
 * @Date: 2021-03-29 16:26:44
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-25 22:10:11
 */

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Typography,
  IconButton,
  Tabs,
  Tab,
} from '@material-ui/core';
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@material-ui/lab';
import CloseIcon from '@material-ui/icons/Close';
import {
  getGithubCommitType,
  gitCommitColorByType,
  githubCommitTypes,
} from '@/utils/common';
import { commitList } from '@/apis/github';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import dayjs from 'dayjs';
import './style/index.less';
import { Empty, LoadMore } from '@/components/global';
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
  const [commits, setCommits] = useState([] as CommitValueTypes[]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [nomore, setNomore] = useState<boolean>(false);
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

  useEffect(() => {
    if (open) {
      setPage(0);
    } else {
      setCommits([]);
      setPage(0);
      setNomore(false);
      setLoading(false);
    }
  }, [open]);

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
