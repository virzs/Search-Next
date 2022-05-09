/*
 * @Author: Vir
 * @Date: 2021-10-09 21:25:26
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-09 09:23:57
 */
import { commitList } from '@/apis/github';
import Loading from '@/components/global/loading/loading';
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';
import {
  formatText,
  getGithubCommitType,
  githubCommitTypes,
} from '@/utils/common';
import { Empty } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

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

const Commits: React.FC = () => {
  const [commits, setCommits] = React.useState([] as CommitValueTypes[]);
  const [page, setPage] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(false);

  const getList = (page: number) => {
    setPage(page);
    setLoading(true);
    commitList(page)
      .then((res) => {
        const formatCommit = res.data.map((i: CommitSourceValueTypes) => {
          let { email, ...author } = i.commit.author;
          return {
            author: {
              ...author,
              avatar_url: i.author.avatar_url,
              html_url: i.author.html_url,
            },
            url: i.html_url,
            message: i.commit.message,
          };
        });
        setCommits(formatCommit);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  React.useEffect(() => {
    getList(page);
  }, []);

  return (
    <div>
      <Loading loading={loading}>
        <ContentList>
          {commits.length ? (
            commits.map((i, j) => (
              <ItemCard
                key={j}
                title={formatText(i.message)}
                desc={`${i.author.name} ${dayjs(i.author.date).format(
                  'YYYY/MM/DD',
                )}`}
                onClick={() => window.open(i.url)}
              ></ItemCard>
            ))
          ) : (
            <Empty></Empty>
          )}
        </ContentList>
      </Loading>
      <a
        className="flex justify-center mt-2 bg-gray-100 rounded p-1"
        href="https://github.com/virzs/Search-Next/commits/master"
        target="_blank"
      >
        在GitHub上查看更多
      </a>
    </div>
  );
};

export default Commits;
