/*
 * @Author: Vir
 * @Date: 2021-11-05 09:09:14
 * @Last Modified by: Vir
 * @Last Modified time: 2021-11-05 10:05:13
 */
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import 'github-markdown-css/github-markdown.css';
import { css } from '@emotion/css';
import classNames from 'classnames';

export interface MarkdownProps {
  source: ((props: any) => JSX.Element) | string;
}

const markdownStyleCustom = css`
  background-color: transparent !important;
  ul {
    list-style: disc;
  }
`;

const Markdown: React.FC<MarkdownProps> = ({ source, ...props }) => {
  return (
    <div
      className={classNames('markdown-body box-border', markdownStyleCustom)}
    >
      {typeof source === 'string' ? (
        <ReactMarkdown
          {...props}
          children={source}
          remarkPlugins={[remarkGfm]}
        />
      ) : (
        React.createElement(source as React.FC)
      )}
    </div>
  );
};

export default Markdown;
