/*
 * @Author: Vir
 * @Date: 2021-06-02 11:59:14
 * @Last Modified by: Vir
 * @Last Modified time: 2021-06-02 14:18:56
 */

import { hitokoto } from '@/apis/hitokoto';
import { HitokotoCType, HitokotoType } from '@/apis/hitokoto/interface';
import { IconButton } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import dayjs from 'dayjs';
import React from 'react';
import { HelloMsgResolveType } from './interface';
import './style.less';

/*
  根据时间提示信息及一言组件，调用方式：

  const { enqueueSnackbar } = useSnackbar();

  helloMsg().then(res=>{
    enqueueSnackbar(res?.content, { content: res?.node });
  })

  返回类型详见：HelloMsgResolveType

*/

// 根据当前时间消息提示
export const helloMsg = () => {
  return new Promise<HelloMsgResolveType>((resolve) => {
    const now = dayjs().hour();
    let str_now = '';
    if (now < 6) {
      str_now = '凌晨好！';
    } else if (now < 9) {
      str_now = '早上好！';
    } else if (now < 12) {
      str_now = '上午好！';
    } else if (now < 14) {
      str_now = '中午好！';
    } else if (now < 17) {
      str_now = '下午好！';
    } else if (now < 19) {
      str_now = '傍晚好！';
    } else if (now < 22) {
      str_now = '晚上好！';
    } else {
      str_now = '已经很晚了，请注意休息';
    }

    const items: HitokotoCType[] = ['d', 'h', 'i'];
    const item: HitokotoCType = items[Math.floor(Math.random() * items.length)];

    hitokoto({ c: item })
      .then((res) => {
        const data: HitokotoType = res.data;
        resolve({
          content: str_now,
          hitokoto: data,
          node: (key, closeSnackbar) => (
            <div
              className="hello-msg-root"
              style={{
                background: '#666',
              }}
            >
              <IconButton
                className="hello-msg-close"
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => closeSnackbar(key)}
              >
                <Close fontSize="inherit" />
              </IconButton>
              <div className="hello-msg-content">
                <p>{str_now}</p>
                <p>{data.hitokoto}</p>
                <p>——{data.from}</p>
              </div>
            </div>
          ),
        });
      })
      .catch(() => {
        resolve({ content: str_now, node: () => <></> });
      });
  });
};
