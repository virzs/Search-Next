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
} from '@material-ui/core';
import { getGithubCommitType } from '@/utils/common';
import { commitList } from '@/apis/github';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import dayjs from 'dayjs';

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

export const UpdateRecordDialog: React.FC<UpdateRecordDialogPropTypes> = ({
  open,
  onClose,
  ...props
}) => {
  const intl = useIntl();
  const [commits, setCommits] = useState([] as CommitValueTypes[]);

  const getCommitList = () => {
    commitList().then((res) => {
      const formatCommit = res.data.map(
        (i: {
          commit: { author: { [x: string]: any; email: any }; message: string };
          author: { avatar_url: any; html_url: any };
          html_url: any;
        }) => {
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
        },
      );
      setCommits(formatCommit);
    });
  };

  useEffect(() => {
    getCommitList();
  }, []);
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle id="scroll-dialog-title">
        {intl.formatMessage({ id: 'UPDATE_RECORD_DIALOG_TITLE' })}
      </DialogTitle>
      <DialogContent dividers>
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
                    <span>{i.author.name}</span>
                    <a href={i.url} target="_brank">
                      {i.message}
                    </a>
                  </React.Fragment>
                }
              ></ListItemText>
            </ListItem>
          ))}
        </List>
      </DialogContent>
    </Dialog>
  );
};
