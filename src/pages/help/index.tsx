/*
 * @Author: Vir
 * @Date: 2021-11-04 16:10:36
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-08 21:35:50
 */
import React from 'react';
import CommitWebsiteMd from '@/data/help/commit_website.md';
import Markdown from '@/components/global/markdown';
import 'github-markdown-css/github-markdown.css';
import classNames from 'classnames';
import { css } from '@emotion/css';
import Copyright from '@/components/global/copyright';

const Help: React.FC = () => {
  return (
    <div className="w-full h-screen flex justify-center bg-gray-50 flex-col items-center">
      <div
        className={classNames(
          'bg-white p-4 shadow flex-grow overflow-y-auto mt-4',
          css`
            max-width: 800px;
          `,
        )}
      >
        <Markdown source={CommitWebsiteMd} />
      </div>
      <div className="my-2">
        <Copyright />
      </div>
    </div>
  );
};

export default Help;
