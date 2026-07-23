import * as path from 'node:path';
import { defineConfig } from 'rspress/config';

export default defineConfig({
  root: path.join(__dirname, 'docs'),
  title: 'Search Next 文档',
  description: 'Search Next Web 端、管理后台与部署维护指南',
  icon: '/search-next-icon.png',
  logoText: 'Search Next 文档',
  logo: {
    light: '/search-next-icon.png',
    dark: '/search-next-icon.png',
  },
  themeDir: path.join(__dirname, 'theme'),
  globalStyles: path.join(__dirname, 'docs/styles.css'),
  themeConfig: {
    outlineTitle: '本页内容',
    searchPlaceholderText: '搜索文档',
    searchNoResultsText: '没有找到相关内容',
    lastUpdated: true,
    lastUpdatedText: '最后更新',
    prevPageText: '上一页',
    nextPageText: '下一页',
    enableScrollToTop: true,
    socialLinks: [
      {
        icon: 'github',
        mode: 'link',
        content: 'https://github.com/virzs/Search-Next',
      },
    ],
  },
});
