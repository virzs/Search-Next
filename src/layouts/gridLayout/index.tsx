import {
  FC,
  RefObject,
  createElement,
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  GridItemHTMLElement,
  GridStack,
  GridStackElement,
  GridStackNode,
  GridStackWidget,
} from "gridstack";
import "gridstack/dist/gridstack.css";
import { Button } from "primereact/button";
import "./index.css";
import GridItem from "./gridItem";
import GridLayoutContext from "./context";
import appConfig from "./widgets/app/config";

import { ContextMenu } from "primereact/contextmenu";
import { MenuItem } from "primereact/menuitem";
import { cx } from "@emotion/css";

interface GridLayoutProps {
  className?: string;
}

interface GridItem extends GridStackWidget {
  id: string;
  el?: JSX.Element;
}

interface GridNode extends GridStackNode {
  [x: string]: unknown;
}

const GridLayout: FC<GridLayoutProps> = () => {
  const [items, setItems] = useState<GridItem[]>([]);

  const refs = useRef<{ [x: string]: RefObject<GridStackElement> }>({});
  const gridRef = useRef<GridStack>();
  const cm = useRef<ContextMenu>();

  const [contextMenuItems, setContextMenuItems] = useState<MenuItem[]>([]);

  const changeItemSizeOrPosition = useCallback(
    (el: GridItemHTMLElement) => {
      const {
        el: x,
        grid,
        _id,
        _initDD,
        _lastUiPosition,
        _orig,
        _prevYPix,
        _rect,
        _dirty,
        _updating,
        ...rest
      } = el.gridstackNode as GridNode;
      const id = el.getAttribute ? el.getAttribute("id") : el.id;
      const els = gridRef.current?.getGridItems();

      setItems(
        items.map((i) => {
          const el = els?.find((e) => e.id === i.id);

          if (i.id === id) {
            return {
              ...i,
              ...rest,
            };
          }
          return {
            ...i,
            x: el?.gridstackNode?.x,
            y: el?.gridstackNode?.y,
          };
        })
      );
    },
    [items]
  );

  useEffect(() => {
    gridRef.current = GridStack.init(
      { float: true, acceptWidgets: true, column: 12 },
      ".grid-layout"
    );
  }, []);

  if (Object.keys(refs.current).length !== items.length) {
    items.forEach(({ id }) => {
      refs.current[id] = refs.current[id] || createRef();
    });
  }

  useEffect(() => {
    if (!gridRef.current) return;
    const grid = gridRef.current;
    grid.batchUpdate();
    grid.removeAll(false);
    items.forEach(({ id, ...rest }) =>
      grid.makeWidget(refs.current[id].current!, rest)
    );
    grid.batchUpdate(false);
    gridRef.current?.on(
      "dragstop",
      function (_: Event, el: GridItemHTMLElement) {
        changeItemSizeOrPosition(el);
      }
    );

    gridRef.current?.on(
      "resizestop",
      function (_: Event, el: GridItemHTMLElement) {
        changeItemSizeOrPosition(el);
      }
    );
  }, [items, gridRef, refs, changeItemSizeOrPosition]);

  return (
    <div>
      <Button
        onClick={() => {
          setItems([
            ...items,
            {
              ...appConfig,
              id: `item-${items.length + 1}`,
              dataSource: {
                name: "百度",
                url: "https://www.baidu.com",
                icon: "https://www.baidu.com/favicon.ico",
              },
            },
          ]);
        }}
      >
        新增 App
      </Button>
      <GridLayoutContext.Provider
        value={{
          container: gridRef.current,
          items: refs.current,
          cm: cm.current,
          setContextMenuItems,
        }}
      >
        <div className="grid-stack h-screen grid-layout">
          {items.map((i) => {
            return (
              <GridItem key={i.id} {...i}>
                {i.el
                  ? createElement(i.el, {
                      dataSource: i.dataSource,
                    })
                  : i.id}
              </GridItem>
            );
          })}
        </div>
      </GridLayoutContext.Provider>
      <ContextMenu
        model={contextMenuItems?.map((i) => ({
          ...i,
          icon: i.icon ? <i className={cx(i.icon, "mr-2")}></i> : undefined,
        }))}
        ref={cm}
        breakpoint="767px"
      />
    </div>
  );
};

export default GridLayout;
