/*
 * @Author: Vir
 * @Date: 2021-05-25 11:21:08
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-26 17:28:02
 */
import { releasesList } from '@/apis/github';
import { GithubReleaseType } from '@/apis/github/interface';
import { Card, CardContent, CardHeader } from '@material-ui/core';
import dayjs from 'dayjs';
import React from 'react';
import { useIntl } from 'umi';
import { Empty, LoadMore } from '../global';

export interface ReleasePagePropsType {
  loading: boolean;
  onAfterLoading: () => void;
}

// 历史版本
const ReleasePage: React.FC<ReleasePagePropsType> = ({
  loading,
  onAfterLoading,
}) => {
  const { formatMessage } = useIntl();
  const [releases, setReleases] = React.useState([] as GithubReleaseType[]);
  const [nomore, setNomore] = React.useState<boolean>(false);
  const [page, setPage] = React.useState<number>(1);

  const getList = (page: number) => {
    setPage(page);
    releasesList(page).then((res) => {
      if (res.data.length === 0) {
        setNomore(true);
        return;
      }
      setReleases(releases.concat(res.data));
      onAfterLoading();
    });
  };

  React.useEffect(() => {
    getList(page);
  }, []);

  React.useEffect(() => {
    console.log(page);
    if (loading) getList(page + 1);
  }, [loading]);

  return (
    <>
      {releases.length ? (
        <>
          {releases.map((i, j: number) => (
            <Card key={j} className="release-card-root">
              <p className="release-tag">{i.tag_name}</p>
              <CardHeader className="release-title" title={i.name}></CardHeader>
              <CardContent className="release-content">
                <div className="release-author">
                  <img src={i.author.avatar_url} alt="" />
                  <span>{i.author.login}</span>
                  <span>
                    {dayjs(i.published_at).format('YYYY-MM-DD HH:mm:ss')}
                  </span>
                </div>
                <pre className="release-body">{i.body}</pre>
                <a className="release-more" href={i.html_url} target="_blank">
                  {formatMessage({ id: 'app.global.link.show_more' })}
                </a>
              </CardContent>
            </Card>
          ))}
          {loading && <LoadMore nomore={nomore} />}
        </>
      ) : (
        <Empty />
      )}
    </>
  );
};

export default ReleasePage;
