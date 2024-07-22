import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { SortItem } from "./types";
import { v4 as uuidv4 } from "uuid";
import SortableUtils from "./utils";

interface ContextMenu {
  rect: DOMRect;
  data: any;
}

type ListStatus = "onMove";

export interface SortableContextProps {
  list: SortItem[];
  setList: any;
  contextMenu: ContextMenu | null;
  setContextMenu: (e: ContextMenu | null) => void;
  listStatus: ListStatus | null;
  setListStatus: (e: ListStatus | null) => void;
  contextMenuFuns: (data: any) => any;
  hideContextMenu: () => void;
  /** 点击右键菜单信息数据 */
  showInfoItemData: SortItem | null;
  setShowInfoItemData: (e: SortItem | null) => void;
  /** group item 点击打开弹窗数据 */
  openGroupItemData: SortItem | null;
  setOpenGroupItemData: (e: SortItem | null) => void;
  /** 长按事件状态 */
  longPressTriggered: boolean;
  removeItem: (id: string) => void;
  /** 当前移动的元素id */
  moveItemId: string | null;
  setMoveItemId: (e: string | null) => void;
  /** 当前元素将要移动到的元素id */
  moveTargetId: string | number | null;
  setMoveTargetId: (e: string | number | null) => void;
}

export const SortableContext = createContext<SortableContextProps>({
  list: [],
  setList: () => {},
  contextMenu: null,
  setContextMenu: () => {},
  listStatus: null,
  setListStatus: () => {},
  contextMenuFuns: () => {},
  hideContextMenu: () => {},
  showInfoItemData: null,
  setShowInfoItemData: () => {},
  openGroupItemData: null,
  setOpenGroupItemData: () => {},
  longPressTriggered: false,
  removeItem: () => {},
  moveItemId: null,
  setMoveItemId: () => {},
  moveTargetId: null,
  setMoveTargetId: () => {},
});

interface SortableProviderProps {
  children: ReactNode;
  list?: any[];
}

export const SortableProvider = ({
  children,
  list: propList = [],
}: SortableProviderProps) => {
  const [contextMenuTimer, setContextMenuTimer] = useState<NodeJS.Timeout>();
  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout>();
  const [listStatus, setListStatus] = useState<ListStatus | null>(null);
  const listStatusRef = useRef(listStatus);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [list, setList] = useState<any[]>([]);
  const [showInfoItemData, setShowInfoItemData] = useState<SortItem | null>(
    null
  );
  const [openGroupItemData, setOpenGroupItemData] = useState<SortItem | null>(
    null
  );
  const [longPressTriggered, setLongPressTriggered] = useState(false);
  const [moveItemId, setMoveItemId] = useState<string | null>(null);
  const [moveTargetId, setMoveTargetId] = useState<string | number | null>(
    null
  );

  const hideContextMenu = () => {
    setContextMenu(null);
    clearTimeout(contextMenuTimer);
    setContextMenuTimer(undefined);
    listStatusRef.current = null;
  };

  const getItemRectAndSetContextMenu = (e: any, data: any) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ ...e, rect, data });
    clearTimeout(contextMenuTimer);
  };

  const contextMenuFuns = (data: any) => {
    return {
      onMouseDown: (e: any) => {
        setContextMenuTimer(
          setTimeout(() => {
            // 解决闭包导致拖拽时右键菜单不消失的问题
            if (listStatusRef.current !== null) return;
            getItemRectAndSetContextMenu(e, data);
          }, 800)
        );
        setLongPressTriggered(false);
        setPressTimer(
          setTimeout(() => {
            setLongPressTriggered(true);
            // 这里处理长按事件
          }, 800)
        );
      },
      onMouseUp: () => {
        clearTimeout(pressTimer);
        setPressTimer(undefined);
        clearTimeout(contextMenuTimer);
        setContextMenuTimer(undefined);
      },
      onContextMenu: (e: any) => {
        e.preventDefault();
        getItemRectAndSetContextMenu(e, data);
      },
    };
  };

  const _setList = (
    newList: SortItem[],
    parentIds?: string[],
    from?: string
  ) => {
    const _parentIds = [...(parentIds || [])];

    if (_parentIds.length > 0) {
      setList((oldList: SortItem[]) => {
        const _items = [...oldList];

        const updateChild = (_list: SortItem[]) => {
          const parentId = _parentIds.shift();
          const parent = _list.find((item) => item.id === parentId);

          if (_parentIds.length && parent) {
            updateChild(parent.children || []);
          } else if (parent) {
            let newChildren: SortItem[] = [];

            if (!parent.children?.length && newList.length) {
              newChildren = [{ ...parent }];
              parent.data = null;
              parent.type = "group";
              parent.children = [...newChildren, ...newList];
              parent.id = uuidv4();
              return;
            }

            if (newList.length === 1) {
              const _i = newList[0];
              parent.data = _i.data;
              parent.type = _i.type;
              parent.children = [];
              parent.config = _i.config;
              parent.id = _i.id;
              return;
            }

            // ! 当前已经是 group 时，直接将 children 更改为最新的 list
            parent.children = [...SortableUtils.uniqueArray(newList)];
          } else {
            _list = SortableUtils.uniqueArray(newList);
          }
        };
        updateChild(_items);

        return _items;
      });
    } else {
      // ! 直接排序
      setList((_list) => {
        _list = newList;
        return [..._list];
      });
    }
  };

  const removeItem = (id: string) => {
    setList((prevList) => {
      const _list = [...prevList];
      const removeItem = (list: SortItem[]) => {
        for (let i = 0; i < list.length; i++) {
          if (list[i].id === id) {
            list.splice(i, 1);
            break;
          } else if (list[i].children?.length !== undefined) {
            removeItem(list[i].children!);
          }
        }
      };

      removeItem(_list);

      return _list;
    });
  };

  useEffect(() => {
    if (propList?.length > 0 && list.length === 0) {
      _setList(propList);
    }
    // eslint-disable-next-line
  }, [propList]);

  useEffect(() => {
    listStatusRef.current = listStatus;
    if (listStatus !== null) {
      hideContextMenu();
    }
    // eslint-disable-next-line
  }, [listStatus]);

  return (
    <SortableContext.Provider
      value={{
        list,
        setList: _setList,
        contextMenu,
        setContextMenu,
        listStatus,
        setListStatus,
        contextMenuFuns,
        hideContextMenu,
        showInfoItemData,
        setShowInfoItemData,
        openGroupItemData,
        setOpenGroupItemData,
        longPressTriggered,
        removeItem,
        moveItemId,
        setMoveItemId,
        moveTargetId,
        setMoveTargetId,
      }}
    >
      {children}
    </SortableContext.Provider>
  );
};
