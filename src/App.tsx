/*
 * @Author: Vir
 * @Date: 2021-09-08 14:22:02
 * @Last Modified by: Vir
 * @Last Modified time: 2022-06-30 18:01:16
 */

import React, { Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import GlobalLoading from './components/global/loading';
import routers, { Router } from './config/router';
import RenderContent from './components/global/renderContent';
import { SnackbarProvider } from 'notistack';
import ToastContainer from './components/global/feedback/toast/container';
import Error from './views/error';

// 处理路由数据
const Recursive = (routes: Router[], parent?: Router, basePath?: string) => {
  let list = routes;
  return list.map((i) => {
    const Element = (props: any) => {
      document.title = parent ? `${parent.title}-${i.title}` : i.title || '';
      const newProps = {
        ...props,
        route: i,
        pathname: `${basePath}/${i.path}`,
      };

      return (
        <RenderContent {...newProps} noOutlet={['setting'].includes(i.path)}>
          {React.createElement(i.component, newProps)}
        </RenderContent>
      );
    };

    let pathname = basePath ? `${basePath}/${i.path}` : `/${i.path}`;

    return (
      <Route
        path={i.routes ? i.path : `${i.path}/*`}
        key={i.path}
        element={<Element />}
      >
        {i.routes ? Recursive(i.routes, i, pathname) : undefined}
        {/* 单独为设置页添加异常页面，排除首页及导航页 */}
        {['setting'].includes(i.path) && (
          <>
            <Route path={`error/:status`} element={<Error />}></Route>
            <Route path="*" element={<Navigate to={`error/404`} replace />} />
          </>
        )}
      </Route>
    );
  });
};

function App(props: any) {
  return (
    <div className="App">
      <Suspense fallback={<GlobalLoading />}>
        <SnackbarProvider
          maxSnack={1}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <HashRouter>
            <Routes>
              {Recursive(routers)}
              {/* 全局异常页面 */}
              <Route path={`error/:status`} element={<Error />}></Route>
              <Route path="*" element={<Navigate to={`error/404`} replace />} />
            </Routes>
          </HashRouter>
        </SnackbarProvider>
      </Suspense>
      <ToastContainer />
    </div>
  );
}

export default App;
