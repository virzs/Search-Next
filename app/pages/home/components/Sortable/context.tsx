import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { SortItem } from "./types";

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
  showInfoItemData: SortItem | null;
  setShowInfoItemData: (e: SortItem | null) => void;
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
});

interface SortableProviderProps {
  children: ReactNode;
  list?: any[];
}

let contextMenuTimer: NodeJS.Timeout;

export const SortableProvider = ({
  children,
  list: propList = [],
}: SortableProviderProps) => {
  const [listStatus, setListStatus] = useState<ListStatus | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenu | null>(null);
  const [list, setList] = useState<any[]>([]);
  const [showInfoItemData, setShowInfoItemData] = useState<SortItem | null>(
    null
  );

  const hideContextMenu = () => {
    setContextMenu(null);
    clearTimeout(contextMenuTimer);
  };

  const getItemRectAndSetContextMenu = (e: any, data: any) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setContextMenu({ ...e, rect, data });
    clearTimeout(contextMenuTimer);
  };

  const contextMenuFuns = (data: any) => {
    return {
      onMouseDown: (e: any) => {
        contextMenuTimer = setTimeout(() => {
          getItemRectAndSetContextMenu(e, data);
        }, 800);
      },
      onMouseUp: () => {
        clearTimeout(contextMenuTimer);
      },
      onContextMenu: (e: any) => {
        e.preventDefault();
        getItemRectAndSetContextMenu(e, data);
      },
    };
  };

  const _setList = (list: SortItem[], parentIds?: string[]) => {
    const _parentIds = [...(parentIds || [])];

    if (_parentIds.length > 0) {
      setList((prevItems) => {
        const _items = [...prevItems];

        const updateChild = (_list: SortItem[]) => {
          const parentId = _parentIds.shift();
          const parent = _list.find((item) => item.id === parentId);

          if (_parentIds.length && parent) {
            updateChild(parent.children || []);
          } else if (parent) {
            parent.children = list;
            if (listStatus !== null) {
              const newParent = { ...parent };
              newParent.children = [];
              parent.children = [newParent, ...list].filter(
                (item) => item.type === "app"
              );
              parent.data = null;
              parent.type = "group";
            }
          } else {
            _list = list;
          }
        };

        updateChild(_items);

        return _items;
      });
    } else {
      setList((_list) => {
        _list = list;
        return [..._list];
      });
    }
  };

  useEffect(() => {
    if (propList?.length > 0 && list.length === 0) {
      _setList(propList);
    }
  }, [propList]);

  useEffect(() => {
    if (listStatus !== null) {
      hideContextMenu();
    }
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
      }}
    >
      {children}
    </SortableContext.Provider>
  );
};

export const useSortable = () => {
  const state = useContext(SortableContext);

  return state;
};
