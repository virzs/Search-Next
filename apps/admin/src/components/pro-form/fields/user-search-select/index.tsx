import { searchUsers } from "@/services/user";
import { ProForm, ProFormSelectProps } from "@ant-design/pro-components";
import { debounce, isArray, isObject } from "lodash";
import { FC, useEffect, useMemo, useState } from "react";
import { Select } from "antd";
import type { DefaultOptionType } from "antd/es/select";

export interface User {
  _id: string;
  username: string;
  email: string;
}

export interface UserSearchSelectProps extends ProFormSelectProps {
  value?: (number | string | User)[] | number | string | User;
}

const toUserId = (item: number | string | User) => (isObject(item) ? item._id : String(item));

const mergeUsers = (left: User[] = [], right: User[] = []) => {
  const map = new Map<string, User>();
  [...left, ...right].forEach((user) => {
    if (user?._id) {
      map.set(user._id, user);
    }
  });
  return Array.from(map.values());
};

export const UserSearchSelect: FC<UserSearchSelectProps> = (props) => {
  const { fieldProps, value, ...rest } = props;
  const [cachedOptions, setCachedOptions] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const initialUsers = useMemo(() => {
    if (isObject(value) && !isArray(value) && value?._id) {
      return [value];
    }
    if (isArray(value) && value.length > 0 && value.every((item) => isObject(item))) {
      return value;
    }
    return [] as User[];
  }, [value]);

  const selectValue = useMemo(() => {
    if (isArray(value)) {
      return value.map(toUserId);
    }
    if (isObject(value) && value?._id) {
      return value._id;
    }
    if (value === "") {
      return undefined;
    }
    return value as string | number | undefined;
  }, [value]);

  useEffect(() => {
    if (initialUsers.length > 0) {
      setCachedOptions((prev) => mergeUsers(prev, initialUsers));
    }
  }, [initialUsers]);

  useEffect(() => {
    const ids = isArray(selectValue) ? selectValue : selectValue === undefined || selectValue === null ? [] : [selectValue];
    if (!ids.length) return;

    let active = true;

    const hydrateUsers = async () => {
      setLoading(true);
      try {
        const results = await Promise.all(ids.map((id) => searchUsers({ keyWords: String(id) })));
        if (!active) return;
        const matchedUsers = results.flat().filter(Boolean) as User[];
        setCachedOptions((prev) => mergeUsers(prev, matchedUsers));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    hydrateUsers();

    return () => {
      active = false;
    };
  }, [selectValue]);

  const selectOptions: DefaultOptionType[] = useMemo(
    () =>
      cachedOptions.map((user) => ({
        label: `${user.username || user._id} (${user.email || "-"})`,
        value: user._id,
        data: user,
      })),
    [cachedOptions]
  );

  const handleSearch = useMemo(
    () =>
      debounce(async (kw: string) => {
        const keyWord = (kw ?? "").trim();
        if (!keyWord) {
          setCachedOptions((prev) => mergeUsers(prev, initialUsers));
          return;
        }
        try {
          setLoading(true);
          const res = (await searchUsers({ keyWords: keyWord })) as User[];
          setCachedOptions((prev) => mergeUsers(prev, res ?? []));
        } finally {
          setLoading(false);
        }
      }, 800),
    [initialUsers]
  );

  useEffect(() => () => handleSearch.cancel(), [handleSearch]);

  return (
    <Select
      showSearch
      loading={loading}
      placeholder="请输入姓名、账号或邮箱搜索用户"
      popupMatchSelectWidth={false}
      filterOption={false}
      onSearch={(v) => {
        handleSearch(v);
        fieldProps?.onSearch?.(v);
      }}
      {...fieldProps}
      onChange={rest.onChange}
      options={selectOptions}
      value={selectValue}
    />
  );
};

const ProFormUserSearchSelect: FC<UserSearchSelectProps> = (props) => {
  return (
    <ProForm.Item {...props}>
      <UserSearchSelect {...props} />
    </ProForm.Item>
  );
};

export default ProFormUserSearchSelect;
