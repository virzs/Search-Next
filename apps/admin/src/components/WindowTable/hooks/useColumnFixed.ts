import { HeaderGroup } from "@tanstack/react-table";
import { WindowTableColumnType } from "../interface";
import { useEffect, useState, useMemo } from "react";

interface ColumnFixedProps<RecordType> {
  columns: WindowTableColumnType<RecordType>[];
  headers?: HeaderGroup<RecordType>[];
}

export interface FixedColumn {
  id: string;
  left?: number;
  right?: number;
}

const useColumnFixed = <RecordType extends object>(
  props: ColumnFixedProps<RecordType>
) => {
  const { columns, headers } = props;
  const [fixedColumns, setFixedColumns] = useState<FixedColumn[]>([]);
  const [isScrollX, setIsScrollX] = useState(false);

  const filterFixedColumns = useMemo(() => {
    return columns
      .filter((column) => column.fixed)
      .map((i) => ({
        ...i,
        dataIndex:
          i.dataIndex instanceof Array ? i.dataIndex.join(".") : i.dataIndex,
      }));
  }, [columns]);

  const getIsScrollX = () => {
    const tableBox = document.querySelector("#window-table-virtuoso");
    const table = document.querySelector(".window-table");

    const isScrollX = tableBox?.clientWidth! + 18 < table?.clientWidth!;
    setIsScrollX(isScrollX);
  };

  useEffect(() => {
    getIsScrollX();
    let p: FixedColumn[] = [];
    headers?.forEach((i) => {
      // console.log(headers, columns);
      for (let column of i.headers) {
        const fixed = filterFixedColumns.find(
          (j) => j.dataIndex === column.id
        )?.fixed;
        if (fixed) {
          p.push({
            id: column.id,
            [fixed]: column.column.columnDef.size,
          });
        }
      }
    });
    let newP: FixedColumn[] = [];
    let allLeft = p.filter((i) => i.left);
    let allRight = p.filter((i) => i.right);
    // 仅适用于开头或结尾的固定列，中间的固定列不适用
    allLeft.forEach((i, index) => {
      if (index === 0) {
        newP.push({ ...i, left: 0 });
      } else {
        newP.push({ ...i, left: (newP[index - 1]?.left ?? 0) + i.left! });
      }
    });
    allRight.forEach((i, index) => {
      if (index === allRight.length - 1) {
        newP.push({ ...i, right: 0 });
      } else {
        newP.push({
          ...i,
          right: (newP[newP.length - 1]?.right ?? 0) + i.right!,
        });
      }
    });
    setFixedColumns(newP);
  }, [headers, filterFixedColumns]);

  useEffect(() => {
    window.addEventListener("resize", function () {
      this.setTimeout(() => {
        getIsScrollX();
      }, 10);
    });
    return () => {
      window.removeEventListener("resize", function () {
        getIsScrollX();
      });
    };
  }, []);

  return {
    fixedColumns,
    isScrollX,
  };
};

export default useColumnFixed;
