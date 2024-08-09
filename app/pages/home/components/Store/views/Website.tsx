import { getTabsWebsiteClassify } from "@/app/services/website";
import { useRequest } from "ahooks";
import { Input, Tabs } from "antd";
import { useEffect } from "react";
import SortableItem from "../../Sortable/Item";

const WebsiteView = () => {
  const { data } = useRequest(getTabsWebsiteClassify);

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
        items={(data ?? [])
          .filter((i) => i.websites?.length > 0 || i.children?.length > 0)
          .map((_, i) => {
            const id = String(i);
            return {
              label: _.name,
              key: _._id,
              children: (
                <div>
                  <div>
                    {_.websites?.map((k, j) => (
                      <SortableItem
                        data={{
                          data: k,
                          config: {
                            allowResize: false,
                            allowContextMenu: false,
                          },
                        }}
                        itemIndex={j}
                      />
                    ))}
                  </div>
                  <div>
                    {_.children?.map((k, j) => (
                      <div>
                        <div>{k.name}</div>
                        {k.websites?.map((x, q) => (
                          <SortableItem
                            data={{
                              data: x,
                              config: {
                                allowResize: false,
                                allowContextMenu: false,
                              },
                            }}
                            itemIndex={q}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ),
            };
          })}
      />
    </div>
  );
};

export default WebsiteView;
