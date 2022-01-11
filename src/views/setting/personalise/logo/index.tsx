/*
 * @Author: Vir
 * @Date: 2021-10-11 21:56:04
 * @Last Modified by: Vir
 * @Last Modified time: 2022-01-11 21:38:19
 */

import { getAuthDataByKey, updateLogoSetting } from '@/apis/auth';
import OutlineCard from '@/components/global/card/outline-card';
import Select from '@/components/md-custom/form/select';
import { AuthLogo, ClockLogo } from '@/data/account/interface';
import LogoData, { ClockData } from '@/data/logo';
import ContentList from '@/pages/setting/components/contentList';
import ItemAccordion, {
  AccordionDetailItem,
} from '@/pages/setting/components/itemAccordion';
import ItemCard from '@/pages/setting/components/itemCard';
import { Alert, Switch, TextField } from '@mui/material';
import { message } from 'antd';
import React from 'react';

const Logo: React.FC = () => {
  const [logoData, setLogoData] = React.useState<AuthLogo>({
    type: 'clock',
    show: true,
    zoom: true,
  } as AuthLogo);

  const [clockLogoData, setClockLogoData] = React.useState<ClockLogo>(
    {} as ClockLogo,
  );

  const initData = () => {
    const id = localStorage.getItem('account');
    if (!id) return;
    const logoData = getAuthDataByKey(id, 'logo');
    setClockLogoData(logoData.config.clock);
    setLogoData(logoData);
  };

  const updateLogoData = (data: any) => {
    const id = localStorage.getItem('account');
    if (!id) return;
    const newData = {
      ...logoData,
      ...data,
    };
    const update = updateLogoSetting(id, newData);
    if (!update) message.error('设置logo出现错误');
    setClockLogoData(newData.config.clock);
    setLogoData(newData);
  };

  React.useEffect(() => {
    initData();
  }, []);

  return (
    <div>
      <ContentList>
        <ItemCard
          title="Logo显示"
          desc="设置首页是否显示Logo"
          action={
            <Switch
              checked={logoData?.show}
              onChange={(e) => updateLogoData({ show: e.target.checked })}
            />
          }
        />
        <ItemCard
          title="Logo缩放"
          desc="设置首页Logo在点击搜索框时是否缩放"
          action={
            <Switch
              checked={logoData?.zoom}
              onChange={(e) => updateLogoData({ zoom: e.target.checked })}
            />
          }
        />
        <ItemCard
          title="Logo类型"
          desc="设置首页显示Logo的类型"
          action={
            <Select
              label="Logo类型"
              size="small"
              value={logoData?.type}
              onChange={(e) => updateLogoData({ type: e.target.value })}
              options={LogoData.filter((i) => i.show).map((i) => ({
                value: i.value,
                label: i.name,
              }))}
            ></Select>
          }
        />
        <ItemAccordion title="Logo样式" desc="设置首页显示Logo的样式">
          {logoData.type === 'clock' && (
            <div className="flex flex-col gap-2">
              {ClockData.map((i) => (
                <OutlineCard
                  fullWidth
                  key={i.id}
                  id={i.value}
                  value={clockLogoData.type}
                  tip={i.tooltip}
                  label={i.title}
                  onChange={(val) =>
                    updateLogoData({
                      config: {
                        ...logoData.config,
                        clock: { type: val },
                      },
                    })
                  }
                >
                  <div className="flex justify-center items-center p-2">
                    {React.createElement(i.component)}
                  </div>
                </OutlineCard>
              ))}
            </div>
          )}
          {logoData.type === 'image' && (
            <AccordionDetailItem
              title="在线图片地址"
              action={
                <TextField
                  size="small"
                  label="链接"
                  value={''}
                  placeholder="请输入图片链接"
                  onFocus={() => {}}
                  onChange={(e) => {}}
                  onBlur={(e) => {}}
                />
              }
            />
          )}
          {logoData.type !== 'clock' && <Alert severity="info">敬请期待</Alert>}
        </ItemAccordion>
      </ContentList>
    </div>
  );
};

export default Logo;
