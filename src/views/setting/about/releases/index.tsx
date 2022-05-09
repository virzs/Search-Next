/*
 * @Author: Vir
 * @Date: 2021-10-09 17:13:56
 * @Last Modified by: Vir
 * @Last Modified time: 2022-05-09 09:22:51
 */

import { releasesList } from '@/apis/github';
import { GithubReleaseType } from '@/apis/github/interface';
import ContentList from '@/pages/setting/components/contentList';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import { formatText } from '@/utils/common';
import { Empty } from 'antd';
import dayjs from 'dayjs';
import React from 'react';
import Markdown from '@/components/global/markdown';
import Loading from '@/components/global/loading/loading';

const Releases: React.FC = () => {
  const [releases, setReleases] = React.useState([] as GithubReleaseType[]);
  const [page, setPage] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(false);

  const getList = (page: number) => {
    setPage(page);
    setLoading(true);
    releasesList(page)
      .then((res) => {
        setReleases(res.data);
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
          {releases.length ? (
            <>
              {releases.map((i, j: number) => (
                <ItemAccordion
                  key={j}
                  title={`${i.tag_name} ${i.name}`}
                  desc={`${i.author.login} ${dayjs(i.published_at).format(
                    'YYYY-MM-DD',
                  )}`}
                >
                  <div className="bg-gray-100 rounded p-2">
                    <Markdown source={formatText(i.body)} />
                  </div>
                  <a
                    className="flex justify-center mt-2 bg-gray-100 rounded p-1"
                    href={i.html_url}
                    target="_blank"
                  >
                    在GitHub上查看更多
                  </a>
                </ItemAccordion>
              ))}
            </>
          ) : (
            <Empty />
          )}
        </ContentList>
      </Loading>
      <a
        className="flex justify-center mt-2 bg-gray-100 rounded p-1"
        href="https://github.com/virzs/Search-Next/releases"
        target="_blank"
      >
        在GitHub上查看更多
      </a>
    </div>
  );
};

export default Releases;
