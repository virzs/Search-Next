/*
 * @Author: Vir
 * @Date: 2021-11-05 09:09:14
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-05 10:05:13
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ReactMarkdownOptions } from 'react-markdown/lib/react-markdown';
import 'github-markdown-css/github-markdown.css';
import { css } from '@emotion/css';
import classNames from 'classnames';

export interface MarkdownProps extends ReactMarkdownOptions {}

const markdownStyleCustom = css`
  background-color: transparent;
  ul {
    list-style: disc;
  }
`;

const Markdown: React.FC<MarkdownProps> = ({ ...props }) => {
  return (
    <div
      className={classNames('markdown-body box-border', markdownStyleCustom)}
    >
      <ReactMarkdown {...props} remarkPlugins={[remarkGfm]} />
    </div>
  );
};

export default Markdown;
