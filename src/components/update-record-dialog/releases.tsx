/*
 * @Author: Vir
 * @Date: 2021-05-25 11:21:08
 * @Last Modified by: Vir
 * @Last Modified time: 2021-05-26 17:28:02
 */
import { releasesList } from '@/apis/github';
import { GithubReleaseType } from '@/apis/github/interface';
import { Card, CardContent } from '@material-ui/core';
import React from 'react';
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
            <Card key={j}>
              <CardContent>
                <p>{i.author.login}</p>
                <p>{i.tag_name}</p>
                <p>{i.name}</p>
                <p>{i.body}</p>
                <p>{i.published_at}</p>
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
