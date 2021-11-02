/*
 * @Author: Vir
 * @Date: 2021-11-01 21:56:11
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-02 10:50:25
 */
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';
import { exportFile, fileReader } from '@/utils/common';
import { Button, styled } from '@material-ui/core';
import {
  Download,
  FileDownload,
  SettingsBackupRestore,
  Upload,
} from '@material-ui/icons';
import { message } from 'antd';
import dayjs from 'dayjs';
import React from 'react';

const Input = styled('input')({
  display: 'none',
});

const Backup: React.FC = () => {
  const [downloadCount, setDownloadCount] = React.useState<number>(0);

  const handleBackup = () => {
    if (downloadCount > 5) {
      message.warning('当前下载次数过多，暂停下载');
      return;
    }
    let backupData = {} as { [x: string]: string | null };
    const length = localStorage.length;
    for (let i = 0; i < length; i++) {
      const key = localStorage.key(i);
      if (key) backupData[key] = localStorage.getItem(key);
    }
    exportFile(
      JSON.stringify(backupData),
      `search.virs.xyz_backupData_${dayjs().format(
        'YYYY:MM:DD HH:mm:ss',
      )}.json`,
    );
    message.success('导出成功');
    setDownloadCount(downloadCount + 1);
  };

  const handleFileChange = (e: any) => {
    fileReader(e.target)
      .then((res) => {
        if (res) {
          const data = JSON.parse(res);
          Object.keys(data).forEach((i) => {
            localStorage.setItem(i, data[i]);
          });
          message.success('数据恢复成功');
        }
      })
      .catch((err) => {
        message.error(err);
      });
  };

  return (
    <ContentList>
      <ItemCard
        icon={<SettingsBackupRestore />}
        title="备份"
        action={
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleBackup()}
            startIcon={<Download />}
          >
            下载备份文件
          </Button>
        }
      />
      <ItemCard
        icon={<FileDownload />}
        title="恢复"
        action={
          <label htmlFor="icon-button-file">
            <Input
              accept="application/json"
              id="icon-button-file"
              type="file"
              onChange={handleFileChange}
            />
            <Button
              component="span"
              variant="outlined"
              size="small"
              startIcon={<Upload />}
            >
              上传备份文件
            </Button>
          </label>
        }
      />
    </ContentList>
  );
};

export default Backup;
