import { useContext } from "react";
import { SortableContext } from "./context";

export const useSortable = () => {
  const state = useContext(SortableContext);

  return state;
};
