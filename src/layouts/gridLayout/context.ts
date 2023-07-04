import { GridStack, GridStackElement } from "gridstack";
import { ContextMenu } from "primereact/contextmenu";
import { MenuItem } from "primereact/menuitem";
import { Dispatch, RefObject, SetStateAction, createContext } from "react";

const GridLayoutContext = createContext<{
  container?: GridStack;
  items: { [x: string]: RefObject<GridStackElement> };
  setContextMenuItems: Dispatch<SetStateAction<MenuItem[]>>;
  cm?: ContextMenu;
} | null>(null);

export default GridLayoutContext;
