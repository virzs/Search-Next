/*
 * @Author: Vir
 * @Date: 2022-01-24 14:45:01
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-30 11:58:26
 */

import Markdown from '@/components/global/markdown';
import Select from '@/components/md-custom/form/select';
import channelOptions from '@/data/channel';
import ContentList from '@/pages/setting/components/contentList';
import ContentTitle from '@/pages/setting/components/contentTitle';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import { BugReportOutlined } from '@mui/icons-material';
import { Alert } from '@mui/material';
import React from 'react';
import Docs from './docs.mdx';
import useChannel from '@/hooks/settings/channel/channel';

const Channel: React.FC = () => {
  const [{ channel, option }, { updateChannel }] = useChannel();

  return (
    <div>
      <ContentList>
        <ContentTitle title="预览渠道" />
        <ItemAccordion
          defaultExpanded
          icon={<BugReportOutlined />}
          title="设置预览渠道"
          desc="获取正在开发中功能的预览权限"
          action={
            <Select
              value={channel}
              options={channelOptions}
              onChange={(e) => {
                const val = e.target.value;
                updateChannel(val);
              }}
            />
          }
        >
          {option && (
            <Alert
              severity={
                channel === 'official'
                  ? 'success'
                  : channel === 'beta'
                  ? 'warning'
                  : channel === 'dev'
                  ? 'error'
                  : 'info'
              }
            >
              {option.desc}
            </Alert>
          )}
        </ItemAccordion>
        <ContentTitle title="预览渠道说明" />
        <div className="p-2">
          <Markdown source={Docs} />
        </div>
      </ContentList>
    </div>
  );
};

export default Channel;
