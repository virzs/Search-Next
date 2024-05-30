"use client";

import { useEffect, useState } from "react";
import Sortable from "./components/Sortable";
import { SortableProvider } from "./components/Sortable/context";
import { SortItem } from "./components/Sortable/types";

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

  return (
    <div>
      <SortableProvider list={list}>
        <Sortable />
      </SortableProvider>
    </div>
  );
};

export default Home;
