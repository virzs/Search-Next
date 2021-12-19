/*
 * @Author: Vir
 * @Date: 2021-12-17 17:02:34
 * @Last Modified by: Vir
 * @Last Modified time: 2021-12-19 10:23:19
 */

import { getOtherIconApi, setOtherIconApi } from '@/apis/setting/otherApis';
import Select from '@/components/md-custom/form/select';
import websiteIconApis from '@/data/website';
import ContentList from '@/pages/setting/components/contentList';
import ItemAccordion, {
  AccordionDetailItem,
} from '@/pages/setting/components/itemAccordion';
import RenderContent from '@/pages/setting/components/renderContent';
import { PageProps } from '@/typings';
import { css } from '@emotion/css';
import { Alert, AlertTitle, Chip, SelectChangeEvent } from '@material-ui/core';
import { Done, Close, PendingOutlined } from '@material-ui/icons';
import React from 'react';

interface ApiStatus {
  [id: string]: 'success' | 'warning' | 'error';
}

const OtherApis: React.FC<PageProps> = (props) => {
  const { history, route, children } = props;
  const [iconApi, setIconApi] = React.useState('');
  const [apiStatus, setApiStatus] = React.useState<ApiStatus>({});

  const init = () => {
    const account = localStorage.getItem('account');
    const data = getOtherIconApi({
      userId: account ?? '',
      type: 'icon',
    });
    console.log(data, account);
    setIconApi(data.apiId);
    let map = {} as ApiStatus;
    websiteIconApis.forEach((i) => {
      map[i.id] = 'warning';
    });
    setApiStatus(map);
  };

  const onChange = (event: SelectChangeEvent<any>) => {
    const select = event.target.value;
    setIconApi(select);
    const account = localStorage.getItem('account');
    setOtherIconApi({
      userId: account ?? '',
      apiId: select,
      type: 'icon',
    });
  };

  const StatusChip = (status: string) => {
    const statusMap = {
      warning: (
        <>
          <PendingOutlined /> 等待响应
        </>
      ),
      success: (
        <>
          <Done /> 成功
        </>
      ),
      error: (
        <>
          <Close /> 失败
        </>
      ),
    };
    return (
      <Chip
        size="small"
        color={status as any}
        label={
          <div className="text-sm flex items-center gap-1">
            {(statusMap as any)[status as any]}
          </div>
        }
      />
    );
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <RenderContent
      location={history.location as unknown as Location}
      pChildren={children}
    >
      <ContentList>
        <Alert severity="info">
          <AlertTitle>提示</AlertTitle>
          不同地区，不同网络下各API的表现可能不同，请选择最适合的API以提高使用体验。
        </Alert>
        <ItemAccordion
          title="Website Icon API"
          desc="设置获取网站图标的api"
          action={
            <Select
              label="API"
              value={iconApi}
              size="small"
              onChange={onChange}
              options={websiteIconApis.map((i) => ({
                label: i.name,
                value: i.id,
              }))}
            />
          }
        >
          <div className="flex items-center text-sm gap-1 pb-2">
            <PendingOutlined /> <span>等待响应</span>
            <Done /> <span>成功</span>
            <Close /> <span>失败</span> 状态仅作参考，具体以实际使用为准
          </div>
          {websiteIconApis.map((i) => {
            return (
              <AccordionDetailItem
                key={i.id}
                disabledRightPadding
                title={i.name}
                action={
                  <>
                    {StatusChip(apiStatus[i.id])}
                    <img
                      className={css`
                        display: none;
                      `}
                      src={`${i.url}google.com`}
                      alt={i.name}
                      onLoad={(v) => {
                        setApiStatus({ ...apiStatus, [i.id]: 'success' });
                      }}
                      onError={(err) => {
                        setApiStatus({ ...apiStatus, [i.id]: 'error' });
                      }}
                    />
                  </>
                }
              />
            );
          })}
        </ItemAccordion>
      </ContentList>
    </RenderContent>
  );
};

export default OtherApis;
