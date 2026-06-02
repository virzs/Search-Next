import React, { useState, useMemo } from "react";
import { Input, Empty, List, Pagination } from "antd";
import iconTags from "../../assets/tags.json";
import { css, cx } from "@emotion/css";

// 图标数据类型定义
type IconTagsType = {
  _comment: string;
  [category: string]: string | { [iconName: string]: string };
};

// 图标类型
type IconType = "line" | "fill";

// 图标选择器属性类型
interface IconSelecterProps {
  value?: { iconName: string; iconType: IconType };
  onChange?: (value: { iconName: string; iconType: IconType }) => void;
  defaultIconType?: IconType;
}

// 图标项组件
const IconItem: React.FC<{
  iconName: string;
  iconType: IconType;
  onClick: () => void;
  isSelected?: boolean;
}> = ({ iconName, iconType, onClick, isSelected = false }) => {
  return (
    <div
      className={cx(
        "flex flex-col items-center justify-center p-2 m-1 cursor-pointer rounded-md relative aspect-video",
        isSelected ? "bg-blue-100" : "bg-gray-50 hover:bg-gray-100"
      )}
      onClick={onClick}
    >
      <i
        className={cx(
          `ri-${iconName}-${iconType}`,
          isSelected && "text-blue-600"
        )}
      />
    </div>
  );
};

const IconSelecter: React.FC<IconSelecterProps> = ({
  value,
  onChange,
  defaultIconType = "line",
}) => {
  const [searchText, setSearchText] = useState("");
  const [iconType, setIconType] = useState<IconType>(
    value?.iconType || defaultIconType
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIcon, setSelectedIcon] = useState<
    { iconName: string; iconType: IconType } | undefined
  >(value);
  const pageSize = 48; // 每页显示48个图标

  // 处理页码变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 解析图标数据
  const { iconsByCategory } = useMemo(() => {
    const iconData = iconTags as IconTagsType;
    const cats: string[] = [];
    const iconsByCat: Record<string, { name: string; tags: string }[]> = {};

    // 遍历所有分类
    Object.entries(iconData).forEach(([category, icons]) => {
      if (category === "_comment") return;

      cats.push(category);
      iconsByCat[category] = [];

      // 遍历该分类下的所有图标
      if (typeof icons === "object") {
        Object.entries(icons).forEach(([iconName, tags]) => {
          iconsByCat[category].push({ name: iconName, tags });
        });
      }
    });

    return { categories: cats, iconsByCategory: iconsByCat };
  }, []);

  // 根据搜索文本过滤图标，始终返回扁平化的图标数组
  const filteredIcons = useMemo(() => {
    // 先将所有分类的图标合并为一个数组
    const allIcons = Object.values(iconsByCategory).flat();

    // 如果没有搜索文本，返回所有图标
    if (!searchText) return allIcons;

    // 有搜索文本时，按名称和标签过滤
    return allIcons.filter(
      (icon) =>
        icon.name.toLowerCase().includes(searchText.toLowerCase()) ||
        icon.tags.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [iconsByCategory, searchText]);
  // 当搜索条件变化时，重置页码
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchText, iconType]);
  // 监听 value 属性变化
  React.useEffect(() => {
    if (value) {
      setSelectedIcon(value);
      if (value.iconType && value.iconType !== iconType) {
        setIconType(value.iconType);
      }
    }
  }, [value, iconType]);
  // 处理选择图标
  const handleSelectIcon = (iconName: string) => {
    const newSelection = { iconName, iconType };
    setSelectedIcon(newSelection);

    // 如果有 onChange 回调，更新表单值
    if (onChange) {
      onChange(newSelection);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center">
        <Input
          placeholder="搜索图标"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          prefix={<i className="ri-search-line" />}
          allowClear
          className="flex-1"
        />
      </div>
      <div className="p-2 icon-container">
        <div
          className={cx(
            "overflow-y-auto overflow-x-hidden max-h-[35vh]",
            css`
              .ant-row {
                margin-left: 0 !important;
                margin-right: 0 !important;
              }
            `
          )}
        >
          <List
            grid={{ gutter: 4, column: 4 }}
            dataSource={filteredIcons.slice(
              (currentPage - 1) * pageSize,
              currentPage * pageSize
            )}
            locale={{ emptyText: <Empty description="没有找到匹配的图标" /> }}
            renderItem={(icon) => {
              // 使用 value 或内部状态 selectedIcon 确定是否选中
              const isSelected =
                (value?.iconName === icon.name &&
                  value?.iconType === iconType) ||
                (selectedIcon?.iconName === icon.name &&
                  selectedIcon?.iconType === iconType);

              return (
                <List.Item>
                  <IconItem
                    key={icon.name}
                    iconName={icon.name}
                    iconType={iconType}
                    onClick={() => handleSelectIcon(icon.name)}
                    isSelected={isSelected}
                  />
                </List.Item>
              );
            }}
          />
        </div>
        <div className="mt-4 text-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={filteredIcons.length}
            onChange={handlePageChange}
            showSizeChanger={false}
            size="small"
            align="center"
          />
        </div>
      </div>
    </div>
  );
};

export default IconSelecter;
