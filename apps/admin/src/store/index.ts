import { configureStore } from "@reduxjs/toolkit";
import { tablePageSlice } from "./table-page";

export const store = configureStore({
  reducer: {
    tablePage: tablePageSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
