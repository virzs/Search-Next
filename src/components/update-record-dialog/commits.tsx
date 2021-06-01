/*
 * @Author: Vir
 * @Date: 2021-05-25 11:29:10
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-25 22:13:33
 */

import { commitList } from '@/apis/github';
import {
  getGithubCommitType,
  gitCommitColorByType,
  githubCommitTypes,
} from '@/utils/common';
import { Chip, Card, CardContent } from '@material-ui/core';
import dayjs from 'dayjs';
import React from 'react';
import { LoadMore, Empty } from '../global';

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

export interface CommitPagePropsType {
  loading: boolean;
  onAfterLoading: () => void;
}

const CommitPage: React.FC<CommitPagePropsType> = ({
  loading,
  onAfterLoading,
}) => {
  const [commits, setCommits] = React.useState([] as CommitValueTypes[]);
  const [nomore, setNomore] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);

  const getList = (page: number) => {
    setPage(page);
    commitList(page).then((res) => {
      if (res.data.length === 0) {
        setNomore(true);
        return;
      }
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
      onAfterLoading();
    });
  };

  React.useEffect(() => {
    getList(page);
  }, []);

  React.useEffect(() => {
    if (loading) getList(page + 1);
  }, [loading]);

  return (
    <>
      {commits.length ? (
        <>
          {commits.map((i, j) => (
            <Card key={j} className="commit-card-root">
              <p
                className="commit-tag"
                style={{ backgroundColor: gitCommitColorByType(i.type) }}
              >
                {i.type}
              </p>
              <CardContent className="commit-card-content">
                <div className="commit-author-container">
                  <img src={i.author.avatar_url} alt="" />
                  <span>{i.author.name}</span>
                  <span>{dayjs(i.author.date).format('YYYY/MM/DD')}</span>
                </div>
                <React.Fragment>
                  <a href={i.url} target="_break">
                    {i.message}
                  </a>
                </React.Fragment>
              </CardContent>
            </Card>
          ))}
          {loading && <LoadMore nomore={nomore} />}
        </>
      ) : (
        <Empty></Empty>
      )}
    </>
  );
};

export default CommitPage;
