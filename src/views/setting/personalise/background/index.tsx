/*
 * @Author: Vir
 * @Date: 2021-09-23 11:39:25
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-23 15:36:01
 */

import Select from '@/components/md-custom/form/select';
import ItemAccordion, {
  AccordionDetailItem,
} from '@/pages/setting/components/itemAccordion';
import { Button, SelectChangeEvent } from '@material-ui/core';
import React from 'react';
import Random from './random';
import './styles/background.style.less';

const Background: React.FC = () => {
  const [value, setValue] = React.useState('random'); // 选择背景类型

  const handleChange = (event: SelectChangeEvent<string>) => {
    setValue(event.target.value);
  };

  return (
    <div>
      <ItemAccordion
        title="个性化设置背景"
        desc="背景设置主要适用于主页"
        action={
          <Select
            label="背景类型"
            value={value}
            size="small"
            onChange={handleChange}
            options={[
              { label: '必应壁纸', value: 'random' },
              { label: '每日一图', value: 'everyday' },
              { label: '在线图片', value: 'online' },
            ]}
          />
        }
        disableDetailPadding
      >
        {value === 'random' && <Random />}
        {value === 'online' && (
          <AccordionDetailItem
            title="使用在线图片"
            action={
              <Button variant="outlined" disableElevation size="small">
                添加在线图片
              </Button>
            }
          />
        )}
      </ItemAccordion>
    </div>
  );
};

export default Background;
