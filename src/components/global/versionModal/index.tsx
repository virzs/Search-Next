/*
 * @Author: Vir
 * @Date: 2022-02-10 23:18:52
 * @Last Modified by: Vir
 * @Last Modified time: 2022-02-10 23:30:57
 */
import { getAuthDataByKey, updateAuthDataByKey } from '@/apis/auth';
import { Latest, latest } from '@/apis/github';
import confirm from '@/components/md-custom/dialog/confirm';
import { formatText } from '@/utils/common';
import classNames from 'classnames';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import Markdown from '../markdown';
import { Message } from '@/data/account/interface';
import { LoadingButton } from '@mui/lab';
import { isBoolean } from 'lodash';
import { toast } from 'react-toastify';

interface VersionData {
  data: Latest;
}

const VersionModalContent = ({ data }: VersionData) => {
  const {
    tag_name = '',
    name = '',
    author,
    body = '',
    published_at = '',
  } = data;
  return (
    <div className="max-h-80 overflow-y-auto">
      <h1 className="font-semibold text-lg mb-2">{`${tag_name} (${name})`}</h1>
      <div className={classNames('flex gap-1 items-center mb-2')}>
        <img
          className="w-5 h-5 rounded-full"
          src={author?.avatar_url}
          alt="author_avatar"
        />
        <span>{author?.login}</span>
        <span className="text-sm">
          {dayjs(published_at).format('YYYY-MM-DD HH:mm')}
        </span>
      </div>
      <Markdown source={formatText(body)} />
    </div>
  );
};

const updateToast = () => {
  toast.info('已更新到最新版本');
};

const updateNotification = () => {
  toast.info('已更新到最新版本');
};

const updateModal = (data: Latest, account: string, message: Message) => {
  confirm({
    title: '版本更新',
    type: false,
    content: <VersionModalContent data={data} />,
    cancelText: '不再提示',
    onCancel: () => {
      updateAuthDataByKey(account ?? '', 'message', {
        ...message,
        update: false,
      });
    },
  });
};

const getVersionInfo = () => {
  const account = localStorage.getItem('account');
  const message = getAuthDataByKey(account ?? '', 'message');
  const latestVersion = getAuthDataByKey(account ?? '', 'latestVersion');

  latest().then((res) => {
    if (res.data) {
      const { tag_name = '' } = res.data;
      if (latestVersion === tag_name) return;
      updateAuthDataByKey(account ?? '', 'latestVersion', tag_name);

      if (isBoolean(message?.update)) {
        updateModal(res.data, account || '', message);
      } else {
        const {
          update: privUpdate,
          remind = 'popup',
          interval = 0,
          lastTime,
        } = message?.update || {};

        let remindUpdate;

        switch (remind) {
          case 'message':
            remindUpdate = updateToast;
            break;
          case 'notification':
            remindUpdate = updateNotification;
            break;
          case 'popup':
          default:
            remindUpdate = updateModal;
            break;
        }
        if (!interval) {
          remindUpdate(res.data, account || '', message);
        } else {
          const now = dayjs();
          const last = dayjs(lastTime);
          if (last.isBefore(now.subtract(interval, 'day'))) {
            remindUpdate(res.data, account || '', message);
          }
        }
      }
    }
  });
};

export const VersionInfoButton = () => {
  const [data, setData] = useState<Latest>({} as Latest);
  const [loading, setLoading] = useState(false);

  const getLatest = () => {
    setLoading(true);
    latest()
      .then((res) => {
        setLoading(false);
        if (res.data) {
          setData(res.data);
        }
      })
      .catch((err) => {
        setLoading(false);
      });
  };

  useEffect(() => {
    Object.keys(data).length &&
      confirm({
        title: '当前版本信息',
        type: false,
        content: <VersionModalContent data={data} />,
        showFooter: false,
      });
  }, [data]);

  return (
    <LoadingButton
      loading={loading}
      onClick={(e) => {
        e.stopPropagation();
        getLatest();
      }}
    >
      当前版本信息
    </LoadingButton>
  );
};

export default getVersionInfo;
