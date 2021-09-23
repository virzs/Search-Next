/*
 * @Author: Vir
 * @Date: 2021-08-08 15:26:17
 * @Last Modified by: Vir
 * @Last Modified time: 2021-09-12 18:09:21
 */

import { useRef, useEffect, useCallback } from 'react';

function useDebounce(fn: any, delay: number | undefined = 300, dep = []) {
  const { current } = useRef<{ fn: any; timer: any | undefined }>({
    fn,
    timer: undefined,
  });
  useEffect(
    function () {
      current.fn = fn;
    },
    [fn],
  );

  return useCallback(function f(...args) {
    if (current.timer) {
      clearTimeout(current.timer);
    }
    current.timer = setTimeout(() => {
      current.fn(...args);
    }, delay);
  }, dep);
}

export default useDebounce;
