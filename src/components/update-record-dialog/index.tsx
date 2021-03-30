/*
 * @Author: Vir
 * @Date: 2021-03-29 16:26:44
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-29 21:49:55
 */

import {
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip,
  CircularProgress,
} from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';
import { getGithubCommitType } from '@/utils/common';
import { commitList } from '@/apis/github';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import dayjs from 'dayjs';
import './style/index.less';

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
  type: string;
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
  const intl = useIntl();
  const [commits, setCommits] = useState([] as CommitValueTypes[]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [nomore, setNomore] = useState<boolean>(false);

  const getCommitList = () => {
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
  // TODO 加载更多调用一次接口后才能继续调用下一次
  const contentScroll = (e: { target: any }) => {
    let el = e.target;
    let isBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1; // 修正误差
    if (isBottom) {
      getCommitList();
    }
  };

  // dialog关闭
  const handleClose = () => {
    onClose();
    setPage(0);
    setNomore(false);
  };

  useEffect(() => {
    getCommitList();
  }, []);
  return (
    <Dialog
      className="update-record-dialog"
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle id="scroll-dialog-title">
        {intl.formatMessage({ id: 'UPDATE_RECORD_DIALOG_TITLE' })}
      </DialogTitle>
      <DialogContent dividers onScroll={contentScroll}>
        <List>
          {commits.map((i, j) => (
            <ListItem key={j}>
              <ListItemAvatar>
                <Avatar alt={i.author.name} src={i.author.avatar_url} />
              </ListItemAvatar>
              <ListItemText
                primary={dayjs(i.author.date).format('YYYY/MM/DD')}
                secondary={
                  <React.Fragment>
                    <Chip label={i.type} size="small"></Chip>
                    <span>{i.author.name}</span> - {i.message}
                  </React.Fragment>
                }
              ></ListItemText>
            </ListItem>
          ))}
        </List>
        {loading && (
          <div className="loading-more">
            {nomore ? (
              <span className="loading-content">没有更多数据</span>
            ) : (
              <>
                <CircularProgress size={14} color="inherit" />
                <span className="loading-content">加载中请稍后...</span>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
