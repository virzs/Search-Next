/*
 * @Author: Vir
 * @Date: 2021-06-16 21:19:03
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-17 16:01:04
 */

import { latest } from '@/apis/github';
import { LatestType } from '@/apis/github/interface';
import { UpdateRecordDialog } from '@/components/update-record-dialog';
import { Button, Card, CardContent, Typography } from '@material-ui/core';
import dayjs from 'dayjs';
import React from 'react';
import { useIntl } from 'umi';
import ContentHeader from '../components/contentHeader';
import ContentItemTitle from '../components/contentItemTitle';
import ContentTextSecond from '../components/contentTextSecond';

const About: React.FC = () => {
  const { formatMessage } = useIntl();

  const [lastData, setLastData] = React.useState({} as LatestType);
  const [open, setOpen] = React.useState<boolean>(false);

  const getLast = () => {
    latest().then((res) => {
      setLastData(res.data);
    });
  };

  React.useEffect(() => {
    getLast();
  }, []);

  return (
    <div>
      <ContentHeader title="关于" />
      <div>
        <ContentItemTitle
          title="当前版本"
          desc="当前已发布的版本，实际内容可能与代码进度有一定差异。"
        />
        <Card variant="outlined" style={{ marginBottom: '20px' }}>
          <CardContent>
            <Typography variant="body2" component="p">
              版本：
              <a
                href={lastData.html_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {lastData.tag_name}
              </a>
            </Typography>
            <p></p>
            <Button size="small" onClick={() => setOpen(true)}>
              {formatMessage({ id: 'app.component.uploadrecorddialog.title' })}
            </Button>
          </CardContent>
        </Card>
        <ContentTextSecond style={{ marginBottom: '12px' }}>
          页面基于React，后端基于NestJs开发。
        </ContentTextSecond>
        <ContentTextSecond>Search导航页</ContentTextSecond>
        <ContentTextSecond>
          © {dayjs().format('YYYY')} Vir。保留所有权利。
        </ContentTextSecond>
      </div>
      <UpdateRecordDialog open={open} onClose={() => setOpen(false)} />
    </div>
  );
};

export default About;
