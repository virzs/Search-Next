/*
 * @Author: Vir
 * @Date: 2021-03-25 14:01:37
 * @Last Modified by: Vir
 * @Last Modified time: 2021-03-27 14:42:52
 */

import { CopyrightType } from '@/data/main';
import { copyright as copyrightApi } from '@/apis/common';
import React from 'react';
import dayjs from 'dayjs';

interface CopyrightTypeWithVersion extends CopyrightType {
  version?: string;
}

const Copyright: React.FC = () => {
  const [copyright, setCopyright] = React.useState(
    {} as CopyrightTypeWithVersion,
  );

  const endTime = dayjs(new Date()).format('YYYY');

  const getCopyright = () => {
    copyrightApi().then((res) => {
      setCopyright(res.data);
    });
  };

  React.useEffect(() => {
    getCopyright();
  }, []);

  return (
    <a
      className="copyright text-sm text-gray-300 hover:text-gray-800 font-mono"
      href={copyright.href}
    >
      ©{copyright.startTime}-{endTime} by {copyright.author}. All rights
      reserved.
    </a>
  );
};

export default Copyright;
