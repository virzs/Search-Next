import { createBrowserHistory } from "history";

let history = createBrowserHistory();

export const createHistory = (hotReload = false) => {
  if (!hotReload) {
    history = createBrowserHistory();
  }

  return history;
};

export { history };
