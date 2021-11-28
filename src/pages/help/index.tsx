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

const Help: React.FC = () => {
  return <Markdown source={CommitWebsiteMd} />;
};

export default Help;
