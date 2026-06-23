import { Cell, flexRender } from "@tanstack/react-table";
import { Checkbox } from "antd";
import { Fragment, useMemo } from "react";
import { WindowTableColumnType, WindowTableOnRow } from "./interface";
import { isOperationColumn, getFixedColumnStyle } from "./utils";
import { FixedColumn } from "./hooks/useColumnFixed";
import { cx } from "@emotion/css";

export interface WindowTableRowProps<RecordType> {
  disabled?: boolean;
  selectionDisabled?: boolean;
  columns: WindowTableColumnType<RecordType>[];
  rowKey: string;
  rowIndex: number;
  rowData: RecordType;
  cells: Cell<RecordType, any>[];
  selectedRowKeys: any[];
  onSelectionChange: (value: any[]) => void;
  onRow?: WindowTableOnRow<RecordType>;
  fixedColumns?: FixedColumn[];
  isScrollX?: boolean;
}

function Row<RecordType extends object = any>(props: WindowTableRowProps<RecordType>) {
  const {
    rowKey,
    cells,
    rowData,
    rowIndex,
    selectedRowKeys,
    selectionDisabled,
    onSelectionChange,
    onRow,
    disabled,
    fixedColumns,
    isScrollX,
  } = props;

  const cellElemnts: React.ReactNode = useMemo(() => {
    return cells.map((cell) => {
      const isOperation = isOperationColumn(cell.column.columnDef.id);
      const onClick = onRow?.(rowData, rowIndex).onClick;

      const fixed = getFixedColumnStyle({
        columns: fixedColumns,
        id: cell.column.columnDef.id!,
        color: "#fff",
      });

      return (
        <td
          className={cx("window-table-cell", {
            "cursor-pointer": !isOperation && !disabled && !!onClick,
            "cursor-not-allowed": disabled,
            [fixed?.className ?? ""]: isScrollX,
          })}
          key={cell.id}
          style={{
            width: cell.column.getSize(),
            maxWidth: cell.column.columnDef.maxSize,
            minWidth: cell.column.columnDef.minSize,
            ...(isScrollX ? fixed?.style : {}),
          }}
          onClick={(e) => {
            if (isOperation) {
              return;
            }
            if (disabled) {
              return;
            }

            onClick?.(e);
          }}
        >
          <div className="window-table-cell-content">
            {flexRender(cell.column.columnDef.cell, {
              ...cell.getContext(),
              rowIndex,
            })}
          </div>
        </td>
      );
    });
  }, [cells]);

  const key = (rowData as any)[rowKey];

  return (
    <Fragment>
      <td className="window-table-cell window-table-selection-column">
        <Checkbox
          disabled={disabled || selectionDisabled}
          checked={selectedRowKeys.includes(key)}
          onChange={() => {
            const keys = [...selectedRowKeys];
            if (keys.includes(key)) {
              keys.splice(keys.indexOf(key), 1);
            } else {
              keys.push(key);
            }
            onSelectionChange(keys);
          }}
        />
      </td>
      {cellElemnts}
    </Fragment>
  );
}

export default Row;
