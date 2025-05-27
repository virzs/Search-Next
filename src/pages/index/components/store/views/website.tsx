import { useRequest } from "ahooks";
import { Button, Input, Tabs } from "antd";
import { getTabsWebsiteClassify } from "@/services/website";
import { DesktopAppItem, DesktopGroupItem } from "zs_library";
import { RiArrowDropRightLine } from "@remixicon/react";

const WebsiteView = () => {
  const { data } = useRequest(getTabsWebsiteClassify);

  return (
    <div className="overflow-y-auto">
      <Tabs
        size="small"
        type="card"
        tabBarExtraContent={{
          right: <Input.Search placeholder="搜索" allowClear />,
        }}
        defaultActiveKey="1"
        style={{ height: 220 }}
        items={(data ?? [])
          .filter((i) => i.children?.length > 0)
          .map((_, i) => {
            const id = String(i);
            return {
              label: _.name,
              key: _._id,
              children: (
                <div>
                  {_.children
                    ?.filter((i) => i.websites?.length > 0)
                    .map((k) => (
                      <div key={k._id}>
                        <div className="mb-4 text-lg flex items-center justify-between">
                          {k.name}
                          <Button
                            icon={<RiArrowDropRightLine size={16} />}
                            iconPosition="end"
                            type="dashed"
                            size="small"
                          >
                            更多
                          </Button>
                        </div>
                        <div className="relative flex flex-wrap gap-2">
                          {k.websites?.map((x, q) => (
                            <DesktopGroupItem
                              data={{
                                id: x._id,
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
                      </div>
                    ))}
                </div>
              ),
            };
          })}
      />
    </div>
  );
};

export default WebsiteView;
