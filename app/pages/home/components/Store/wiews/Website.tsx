import { Input, Tabs } from "antd";

const WebsiteView = () => {
  return (
    <div>
      <Tabs
        size="small"
        type="card"
        tabBarExtraContent={{
          right: <Input.Search placeholder="搜索" allowClear />,
        }}
        defaultActiveKey="1"
        style={{ height: 220 }}
        items={new Array(30).fill(null).map((_, i) => {
          const id = String(i);
          return {
            label: `Tab-${id}`,
            key: id,
            disabled: i === 28,
            children: `Content of tab ${id}`,
          };
        })}
      />
    </div>
  );
};

export default WebsiteView;
