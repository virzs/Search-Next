/*
 * @Author: Vir
 * @Date: 2022-05-07 17:31:58
 * @Last Modified by: Vir
 * @Last Modified time: 2022-07-03 21:33:37
 */
import { BorderCard } from '@/components/global/card/styleCard';
import ContentList from '@/pages/setting/components/contentList';
import ContentTitle from '@/pages/setting/components/contentTitle';
import React, { FC } from 'react';
import packageData from '../../../../../package.json';

type DependenciesType = typeof packageData.dependencies;
type DevDependenciesType = typeof packageData.devDependencies;

type DependenciesKeys = keyof DependenciesType;
type DevDependenciesKeys = keyof DevDependenciesType;

type DependeciesObj = {
  [x in DependenciesKeys]: string;
};
type DevDependenciesObj = {
  [x in DevDependenciesKeys]: string;
};

interface LinkProps {
  name: string;
  version: string;
}

const Link: FC<LinkProps> = ({ name, version }) => {
  return (
    <a href={`https://www.npmjs.com/package/${name}`} target="_blank">
      <BorderCard>
        <p className="p-2 px-4 flex justify-between items-center">
          <span className="font-semibold">{name}</span>
          <span>{version}</span>
        </p>
      </BorderCard>
    </a>
  );
};

function Dependencies() {
  const dependencies: DependeciesObj = packageData.dependencies;
  const devDependencies: DevDependenciesObj = packageData.devDependencies;

  return (
    <div>
      <ContentTitle title="说明" />
      <p>本项目的开发离不开以下开源项目的支持。</p>
      <ContentList>
        <ContentTitle title="项目依赖" />
        {Object.keys(dependencies).map((i, j) => (
          <Link
            name={i}
            version={dependencies[i as DependenciesKeys]}
            key={j}
          />
        ))}
      </ContentList>
      <ContentList>
        <ContentTitle title="开发依赖" />
        {Object.keys(devDependencies).map((i, j) => (
          <Link
            name={i}
            version={devDependencies[i as DevDependenciesKeys]}
            key={j}
          />
        ))}
      </ContentList>
    </div>
  );
}

export default Dependencies;
