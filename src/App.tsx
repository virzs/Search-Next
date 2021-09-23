/*
 * @Author: Vir
 * @Date: 2021-09-08 14:22:02
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-18 16:32:05
 */

import React, { Suspense } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import routers, { Router } from './config/router';

// 处理路由数据
const Recursive = (routes: Router[]) => {
  let list = routes;
  return list.map((i) => {
    return (
      <Route
        path={i.path}
        key={i.path}
        exact={i.exact !== undefined ? i.exact : true}
        component={(props: any) =>
          React.createElement(i.component, {
            ...props,
            route: i,
            children: i.routes ? Recursive(i.routes) : undefined,
          })
        }
      />
    );
  });
};

function App(props: any) {
  React.useEffect(() => {
    console.log(props);
  }, []);
  return (
    <div className="App">
      <Suspense fallback={<p>loading</p>}>
        <BrowserRouter>
          <Switch>{Recursive(routers)}</Switch>
        </BrowserRouter>
      </Suspense>
    </div>
  );
}

export default App;
