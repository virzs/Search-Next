import { locale } from "primereact/api";

import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "bootstrap-icons/font/bootstrap-icons.min.css";
import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Router, routes } from "./routes";
import { createElement } from "react";
import RenderOutlet from "./components/renderOutlet";
import ErrorView from "./components/error";

function App() {
  // locale("zh-CN");

  // 处理路由数据
  const Recursive = (routes: Router[], parent?: Router, basePath?: string) => {
    const list = routes;
    return list.map((i) => {
      const Element = (props: object) => {
        document.title = parent ? `${parent.title}-${i.title}` : i.title || "";
        const newProps = {
          ...props,
          route: i,
          pathname: `${basePath}/${i.path}`,
        };

        return (
          <RenderOutlet {...newProps} noOutlet={["setting"].includes(i.path)}>
            {createElement(i.component, newProps)}
          </RenderOutlet>
        );
      };

      const pathname = basePath ? `${basePath}/${i.path}` : `/${i.path}`;

      return (
        <Route
          path={i.routes ? i.path : `${i.path}/*`}
          key={i.path}
          element={<Element />}
        >
          {i.routes ? Recursive(i.routes, i, pathname) : undefined}
          {/* 单独为设置页添加异常页面，排除首页及导航页 */}
          {["setting"].includes(i.path) && (
            <>
              <Route path={`error/:status`} element={<ErrorView />}></Route>
              <Route path="*" element={<Navigate to={`error/404`} replace />} />
            </>
          )}
        </Route>
      );
    });
  };

  return (
    <>
      <BrowserRouter>
        <Routes>{Recursive(routes)}</Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
