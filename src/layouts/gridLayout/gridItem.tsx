import { GridStackWidget } from "gridstack";
import { FC, ReactNode, RefObject, useContext } from "react";
import GridLayoutContext from "./context";

export interface GridItemProps extends GridStackWidget {
  children?: ReactNode;
  id?: string;
}

const GridItem: FC<GridItemProps> = (props) => {
  const { children, id, contextMenus, ...rest } = props;

  const { items = {}, cm, setContextMenuItems } = useContext(GridLayoutContext);

  return (
    <div
      ref={items[id ?? ""] as RefObject<HTMLDivElement>}
      className="grid-stack-item"
      id={id}
      onContextMenu={(e) => {
        if (!contextMenus?.length) return;
        setContextMenuItems(contextMenus);
        cm.show(e);
      }}
    >
      <div className="grid-stack-item-content">{children}</div>
    </div>
  );
};

export default GridItem;
