/*
 * @Author: Vir
 * @Date: 2021-09-08 14:22:02
 * @Last Modified by: Vir
 * @Last Modified time: 2021-10-06 13:35:08
 */

import React, { Suspense } from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import GlobalLoading from './components/global/loading';
import routers, { Router } from './config/router';

// 处理路由数据
const Recursive = (routes: Router[], parent?: Router) => {
  let list = routes;
  return list.map((i) => {
    return (
      <Route
        path={i.path}
        key={i.path}
        exact={i.exact !== undefined ? i.exact : true}
        component={(props: any) => {
          document.title = parent
            ? `${parent.title}-${i.title}`
            : i.title || '';
          return React.createElement(i.component, {
            ...props,
            route: i,
            children: i.routes ? Recursive(i.routes, i) : undefined,
          });
        }}
      />
    );
  });
};

function App(props: any) {
  return (
    <div className="App">
      <Suspense fallback={<GlobalLoading />}>
        <HashRouter>
          <Switch>{Recursive(routers)}</Switch>
        </HashRouter>
      </Suspense>
    </div>
  );
}

export default App;
