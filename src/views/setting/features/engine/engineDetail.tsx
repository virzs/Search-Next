/*
 * @Author: Vir
 * @Date: 2022-02-03 17:00:09
 * @Last Modified by:   Vir
 * @Last Modified time: 2022-02-03 17:00:09
 */
import { getEngineDetailApi, SearchEngineData } from '@/apis/engine';
import { Paper } from '@mui/material';
import dayjs from 'dayjs';
import React, { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const EngineDetail: FC = () => {
  const { id = '' } = useParams();

  const [detail, setDetail] = useState<SearchEngineData>(
    {} as SearchEngineData,
  );

  const getDetail = () => {
    getEngineDetailApi(id).then((res) => {
      setDetail(res);
    });
  };

  useEffect(() => {
    getDetail();
  }, []);

  const Item = ({ label, value }: any) => {
    return (
      <li>
        <div className="p-1 pl-6 flex gap-4">
          <span className="w-1/5">{label}</span>
          <span className="flex-grow">{value === undefined ? '-' : value}</span>
        </div>
      </li>
    );
  };

  return (
    <Paper variant="outlined" className="divide-y">
      <div className="p-3 font-bold text-lg">{detail.name}</div>
      <div className="p-3">
        <ul>
          <Item label="URL" value={detail.href} />
          <Item label="简介" value={detail.description} />
          <Item label="使用次数" value={detail.count} />
          <Item label="分类" value={detail.classify?.name} />
          <Item label="是否显示" value={detail.isShow ? '是' : '否'} />
          <Item
            label="创建时间"
            value={dayjs(detail.createdTime).format('YYYY-MM-DD HH:mm:ss')}
          />
          <Item
            label="更新时间"
            value={dayjs(detail.updatedTime).format('YYYY-MM-DD HH:mm:ss')}
          />
        </ul>
      </div>
    </Paper>
  );
};

export default EngineDetail;
