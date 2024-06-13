import { css } from "@emotion/css";

export const ghostClass = css`
  padding: 8px;
  transition: all 0.2s;
  > div {
    transition: all 0.2s;
    border: 2px solid aquamarine;
    background-color: transparent;
    > div {
      opacity: 0;
      transition: all 0.2s;
    }
  }
`;
