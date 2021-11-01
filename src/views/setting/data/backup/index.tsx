/*
 * @Author: Vir
 * @Date: 2021-11-01 21:56:11
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-01 22:35:38
 */
import ContentList from '@/pages/setting/components/contentList';
import ItemCard from '@/pages/setting/components/itemCard';
import { exportFile } from '@/utils/common';
import { Button } from '@material-ui/core';
import { FileDownload, SettingsBackupRestore } from '@material-ui/icons';
import dayjs from 'dayjs';
import React from 'react';

const Backup: React.FC = () => {
  const handleBackup = () => {
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
          >
            下载备份文件
          </Button>
        }
      />
      <ItemCard
        icon={<FileDownload />}
        title="恢复"
        action={
          <Button variant="outlined" size="small">
            上传备份文件
          </Button>
        }
      />
    </ContentList>
  );
};

export default Backup;
