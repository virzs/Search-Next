import { isDateString } from "@/utils/utils";
import { FilterFilled } from "@ant-design/icons";
import { cx } from "@emotion/css";
import { Column, Table } from "@tanstack/react-table";
import { Checkbox, Dropdown, Input, InputNumber, DatePicker } from "antd";
import { Dayjs } from "dayjs";
import { Fragment, ReactNode, useMemo, useState } from "react";
import { List } from "react-window";

export interface WindowTableFilterProps<RecordType> {
  column: Column<RecordType, any>;
  table: Table<RecordType>;
  filtered?: boolean;
}

function WindowTableFilter<RecordType>(props: WindowTableFilterProps<RecordType>) {
  const { column, table, filtered } = props;
  const [search, setSearch] = useState("");

  const firstValue = useMemo(() => {
    const flatRows = table.getPreFilteredRowModel().flatRows ?? [];
    for (let index = 0; index < flatRows.length; index++) {
      const row = flatRows[index];
      const value = row?.getValue(column.id);
      if (value !== null && value !== undefined) {
        return value;
      }
    }
  }, [table.getPreFilteredRowModel()]);

  const columnFilterValue = column.getFilterValue();

  const sortedUniqueValues = useMemo(() => {
    if (typeof firstValue === "number") {
      return [];
    }

    // ! FIX 空值显示到筛选列表
    return Array.from(column.getFacetedUniqueValues().keys())
      .sort()
      .filter((i) => i !== "");
  }, [column.getFacetedUniqueValues()]);

  const searchedValues = useMemo(() => {
    if (search) {
      return sortedUniqueValues.filter((item) => item?.toString()?.toLowerCase()?.includes(search.toLowerCase()));
    }

    return sortedUniqueValues;
  }, [sortedUniqueValues, search]);

  const renderFilters = () => {
    if (typeof firstValue === "number") {
      return (
        <Fragment>
          <InputNumber
            size="small"
            className="w-full "
            placeholder={"最小"}
            value={(columnFilterValue as [number, number])?.[0]}
            onChange={(value) => column.setFilterValue((old: [number, number]) => [value, old?.[1]])}
          />
          <InputNumber
            size="small"
            className="w-full "
            placeholder={"最大"}
            value={(columnFilterValue as [number, number])?.[1]}
            onChange={(value) => column.setFilterValue((old: [number, number]) => [old?.[0], value])}
          />
          <div className="flex justify-end">
            <a
              className=""
              onClick={() => {
                column.setFilterValue(() => undefined);
              }}
            >
              {"清除"}
            </a>
          </div>
        </Fragment>
      );
    }

    if (typeof firstValue === "string") {
      if (isDateString(firstValue)) {
        const start = (columnFilterValue as [Dayjs, Dayjs])?.[0];
        const end = (columnFilterValue as [Dayjs, Dayjs])?.[1];
        return (
          <Fragment>
            <DatePicker
              className="w-full "
              size="small"
              placeholder={"开始时间"}
              value={start}
              onChange={(value) => column.setFilterValue((old?: [Dayjs, Dayjs]) => [value, old?.[1]])}
            />
            <DatePicker
              className="w-full "
              size="small"
              placeholder={"结束时间"}
              value={end}
              onChange={(value) => column.setFilterValue((old?: [Dayjs, Dayjs]) => [old?.[0], value])}
            />
            <div className="flex justify-end">
              <a
                className=""
                onClick={() => {
                  column.setFilterValue(() => undefined);
                }}
              >
                {"清除"}
              </a>
            </div>
          </Fragment>
        );
      }
      return (
        <Fragment>
          <Input className="w-full " placeholder={"搜索"} value={search} onChange={(e) => setSearch(e.target.value)} />

          <List
            rowHeight={25}
            rowCount={searchedValues.length}
            style={{
              width: "100%",
              height: searchedValues.length > 10 ? 250 : searchedValues.length * 25,
            }}
            rowProps={{}}
            rowComponent={({ style, index }): ReactNode => {
              const value = searchedValues[index];
              return (
                <div key={index} className="flex items-center" style={style}>
                  <Checkbox
                    className="window-table-filter-checkbox max-w-full overflow-hidden text-ellipsis whitespace-nowrap break-all "
                    value={value}
                    checked={(columnFilterValue as string[])?.includes(value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        column.setFilterValue((old?: string[]) => (old ? [...old, value] : [value]));
                      } else {
                        column.setFilterValue((old: string[]) =>
                          old ? old.filter((item) => item !== value) : undefined
                        );
                      }
                    }}
                  >
                    {value}
                  </Checkbox>
                </div>
              );
            }}
          ></List>
          <div className="flex justify-end">
            <a
              className=""
              onClick={() => {
                column.setFilterValue(() => undefined);
              }}
            >
              {"清除"}
            </a>
          </div>
        </Fragment>
      );
    }
    return null;
  };

  return (
    <Dropdown
      arrow
      placement="bottomCenter"
      trigger={["click"]}
      overlay={<div className="py-3 px-4 bg-white w-48 flex flex-col gap-2 shadow rounded">{renderFilters()}</div>}
    >
      <div
        className={cx(
          "ml-1 scale-75",
          filtered ? "text-[var(--ant-color-primary)]" : "text-[var(--ant-table-header-icon-color)]"
        )}
      >
        <FilterFilled />
      </div>
    </Dropdown>
  );
}

export default WindowTableFilter;
