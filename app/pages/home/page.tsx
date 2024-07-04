"use client";

import { useEffect, useState } from "react";
import { SortableProvider } from "./components/Sortable/context";
import { SortItem } from "./components/Sortable/types";
import Header from "./components/Header";
import Footer from "@/app/components/Layout/Footer";
import dynamic from "next/dynamic";
import Sortable from "./components/Sortable";

const Home = () => {
  const [list, setList] = useState<SortItem[]>([
    {
      id: 1,
      type: "app",
      data: {
        name: "one",
      },
      config: {
        col: 2,
      },
      children:
        // 生成20个子项
        Array(60)
          .fill(0)
          .map((_, index) => ({
            id: 1 + index,
            type: "app",
            data: {
              name: `one-${index}`,
            },
          })),
    },
    {
      id: 2,
      type: "app",
      data: {
        name: "two",
      },
    },
    {
      id: 3,
      type: "app",
      data: {
        name: "three",
      },
    },
    {
      id: 4,
      type: "app",
      data: {
        name: "four",
      },
    },
    {
      id: 5,
      type: "app",
      data: {
        name: "five",
      },
    },
    {
      id: 6,
      type: "app",
      data: {
        name: "six",
      },
    },
    {
      id: 7,
      type: "app",
      data: {
        name: "x",
      },
    },
  ]);

  useEffect(() => {
    if (!window) return;
  }, []);

  return (
    <main className="w-screen h-screen flex flex-col items-center justify-center dark:bg-black transition-colors">
      <Header />
      <div className="mx-auto max-w-5xl w-full flex-1">
        <SortableProvider list={list}>
          <Sortable />
        </SortableProvider>
      </div>
      <Footer />
    </main>
  );
};

export default Home;
