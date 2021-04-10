/*
 * @Author: Vir
 * @Date: 2021-03-29 16:26:44
 * @Last Modified by: Vir
 * @Last Modified time: 2021-04-10 16:44:29
 */

import {
  Dialog,
  DialogContent,
  DialogTitle,
  Chip,
  Typography,
  IconButton,
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

  const getCommitList = () => {
    if (!open) return;
    let commitPage = page + 1;
    if (nomore) return;
    setPage(commitPage);
    setLoading(true);
    commitList(commitPage).then((res) => {
      if (res.data.length === 0) return setNomore(true);
      const formatCommit = res.data.map((i: CommitSourceValueTypes) => {
        let { email, ...author } = i.commit.author;
        return {
          author: {
            ...author,
            avatar_url: i.author.avatar_url,
            html_url: i.author.html_url,
          },
          url: i.html_url,
          ...getGithubCommitType(i.commit.message),
        };
      });
      setCommits(commits.concat(formatCommit));
      setNomore(false);
      setLoading(false);
    });
  };

  // dialog滚动事件
  // TODO 弹窗打开时加载数据，关闭时清空
  const contentScroll = (e: { target: any }) => {
    let el = e.target;
    let isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1; // 修正误差
    if (isBottom && !loading) {
      getCommitList();
    }
  };

  // dialog关闭
  const handleClose = () => {
    onClose();
  };

  useEffect(() => {
    if (open) {
      setPage(0);
      getCommitList();
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
        {commits.length ? (
          <>
            <Timeline align="alternate">
              {commits.map((i, j) => (
                <TimelineItem key={j}>
                  <TimelineOppositeContent>
                    <Typography variant="h6" color="textSecondary">
                      {dayjs(i.author.date).format('YYYY/MM/DD')}
                    </Typography>
                    <Chip
                      style={{
                        backgroundColor: gitCommitColorByType(i.type),
                        color: '#fff',
                      }}
                      label={i.type}
                      size="small"
                    ></Chip>
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot />
                    <TimelineConnector />
                  </TimelineSeparator>
                  <TimelineContent>
                    <React.Fragment>
                      <a href={i.url} target="_break">
                        {i.author.name} - {i.message}
                      </a>
                    </React.Fragment>
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
            {loading && <LoadMore nomore={nomore} />}
          </>
        ) : (
          <Empty></Empty>
        )}
      </DialogContent>
    </Dialog>
  );
};
