import { AppDispatch, RootState } from "@/store";
import { EqualityFn, useDispatch, useSelector } from "react-redux";

export const useAppSelector: <Selected = unknown>(
  selector: (state: RootState) => Selected,
  equalityFn?: EqualityFn<Selected> | undefined
) => Selected = useSelector;

export const useAppDispatch: () => AppDispatch = useDispatch;
