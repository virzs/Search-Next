"use client";

import { useEffect, useState } from "react";
import Sortable from "./components/Sortable";
import { SortableProvider } from "./components/Sortable/context";
import { ReactSortable } from "react-sortablejs";
import { SortItem } from "./components/Sortable/types";
import { css, cx } from "@emotion/css";

interface Item {
  id: string;
  content: string;
  children?: Item[];
}

interface SortListProps {
  items: Item[];
  list: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
  parentIds?: string[];
}

const SortList: React.FC<SortListProps> = ({
  list,
  items,
  setItems,
  parentIds,
}) => {
  const setList = (list: Item[]) => {
    const _parentIds = [...(parentIds || [])];

    if (_parentIds.length > 0) {
      setItems((prevItems) => {
        const _items = [...prevItems];

        const updateChild = (_list: Item[]) => {
          const parentId = _parentIds.shift();
          const parent = _list.find((item) => item.id === parentId);

          if (_parentIds.length && parent) {
            updateChild(parent.children || []);
          } else if (parent) {
            parent.children = list;
          } else {
            _list = list;
          }
        };

        updateChild(_items);

        return _items;
      });
    } else {
      setItems((_list) => {
        _list = list;
        return [..._list];
      });
    }
  };

  return (
    <ReactSortable
      group="nested"
      animation={150}
      fallbackOnBody
      swapThreshold={0.65}
      list={list}
      setList={setList}
      tag="ul"
      className={cx(
        "grid gap-3 h-full",
        css`
          grid-template-columns: repeat(auto-fill, 64px);
          grid-auto-flow: dense;
          grid-auto-rows: 64px;
        `
      )}
      onMove={(e) => {
        const { dragged, related } = e;
        const draggedData = dragged.dataset;
        const relatedData = related.dataset;
        console.log(draggedData, relatedData);
        // 限制只有一层
        if (
          (Object.keys(relatedData).length === 0 || relatedData.parentIds) &&
          Number(draggedData.childrenLength) > 0
        ) {
          return false;
        }
        return true;
      }}
    >
      {list.map((item) => (
        <li
          className="shadow-2xl p-2 text-black w-14 h-14 bg-fuchsia-300"
          key={item.id}
          data-parent-ids={parentIds?.join(",")}
          data-children-length={item.children?.length}
        >
          {/* <span className="handle">☰</span> {item.content} */}
          <SortList
            parentIds={[...(parentIds || []), item.id]}
            list={item.children ?? []}
            items={items}
            setItems={setItems}
          />
        </li>
      ))}
    </ReactSortable>
  );
};

const Home = () => {
  const [list, setList] = useState<SortItem[]>([
    {
      id: 1,
      type: "app",
      data: {
        title: "one",
      },
      config: {
        col: 2,
      },
    },
    {
      id: 2,
      type: "app",
      data: {
        title: "two",
      },
    },
    {
      id: 3,
      type: "app",
      data: {
        title: "three",
      },
    },
    {
      id: 4,
      type: "app",
      data: {
        title: "four",
      },
    },
    {
      id: 5,
      type: "app",
      data: {
        title: "five",
      },
    },
    {
      id: 6,
      type: "app",
      data: {
        title: "six",
      },
    },
    {
      id: 7,
      type: "app",
      data: {
        title: "x",
      },
    },
  ]);

  useEffect(() => {
    if (!window) return;
  }, []);

  const nestedItems: Item[] = [
    {
      id: "item-1",
      content: "Item 1",
      children: [
        {
          id: "nested-1",
          content: "Nested 1",
        },
        { id: "nested-2", content: "Nested 2" },
      ],
    },
    {
      id: "item-2",
      content: "Item 2",
      children: [
        { id: "nested-3", content: "Nested 3" },
        { id: "nested-4", content: "Nested 4" },
      ],
    },
  ];

  const [list2, setList2] = useState<Item[]>(nestedItems);

  return (
    <div>
      <SortableProvider list={list}>
        <Sortable />
        <SortList list={list2} items={list2} setItems={setList2} />
      </SortableProvider>
    </div>
  );
};

export default Home;
