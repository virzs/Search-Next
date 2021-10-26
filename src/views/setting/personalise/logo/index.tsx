/*
 * @Author: Vir
 * @Date: 2021-10-11 21:56:04
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-26 15:28:29
 */

import { logoSetting, updateLogoSetting } from '@/apis/auth';
import OutlineCard from '@/components/global/card/outline-card';
import Select from '@/components/md-custom/form/select';
import { AuthLogo, ClockLogo } from '@/data/account/type';
import LogoData, { ClockData } from '@/data/logo';
import ContentList from '@/pages/setting/components/contentList';
import ItemAccordion from '@/pages/setting/components/itemAccordion';
import ItemCard from '@/pages/setting/components/itemCard';
import { Switch } from '@material-ui/core';
import { message } from 'antd';
import React from 'react';

const Logo: React.FC = () => {
  const [logoData, setLogoData] = React.useState<AuthLogo>({
    type: 'clock',
    show: true,
  } as AuthLogo);

  const [clockLogoData, setClockLogoData] = React.useState<ClockLogo>(
    {} as ClockLogo,
  );

  const initData = () => {
    const id = localStorage.getItem('account');
    if (!id) return;
    const logoData = logoSetting(id);
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
          title="Logo类型"
          desc="设置首页是否显示Logo"
          action={
            <Select
              label="Logo类型"
              size="small"
              value={logoData?.type}
              onChange={(e) => updateLogoData({ type: e.target.value })}
              options={LogoData.map((i) => ({ value: i.value, label: i.name }))}
            ></Select>
          }
        />
        {logoData.type === 'clock' && (
          <ItemAccordion title="Logo样式" desc="设置首页显示Logo的样式">
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
          </ItemAccordion>
        )}
      </ContentList>
    </div>
  );
};

export default Logo;
