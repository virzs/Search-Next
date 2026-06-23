import FullPageContainer from "@/components/containter/full";
import { ProDescriptions, ProTable } from "@ant-design/pro-components";
import { Image } from "antd";
import { format } from "date-fns";
import { filesize } from "filesize";
import { FC } from "react";
import ReactJson from "react-json-view";

export interface BaseDetailProps {
  data: any;
  loading: boolean;
}

const BaseDetail: FC<BaseDetailProps> = (props) => {
  const { data, loading } = props;

  const { name, associatedData = [] } = data ?? {};

  const groupedData = associatedData.reduce((acc: any, item: any) => {
    const { associatedDataFrom, ...rest } = item;
    const existingGroup = acc.find(
      (group: any) => group.associatedDataFrom === associatedDataFrom
    );

    if (existingGroup) {
      existingGroup.children.push(rest);
    } else {
      acc.push({ associatedDataFrom, children: [rest] });
    }

    return acc;
  }, []);

  return (
    <FullPageContainer loading={loading} title={name}>
      <ProDescriptions
        title="资源详情"
        dataSource={data}
        columns={[
          {
            title: "创建人",
            dataIndex: ["creator", "username"],
          },
          {
            title: "创建时间",
            dataIndex: "createdAt",
            render: (_) =>
              !!_ && format(new Date(_ as string), "yyyy-MM-dd HH:mm:ss"),
          },
          {
            title: "路径",
            dataIndex: "key",
          },
          {
            title: "类型",
            dataIndex: "mimetype",
          },
          {
            title: "大小",
            dataIndex: "size",
            render: (_) => filesize(_ as number),
          },
          {
            title: "预览",
            span: 24,
            dataIndex: "url",
            render: (_) => {
              return <Image src={_ as string} />;
            },
          },
        ]}
      ></ProDescriptions>
      <ProDescriptions title="关联数据" column={1}>
        <ProTable
          className="w-full"
          cardProps={{
            bodyStyle: {
              padding: 0,
            },
          }}
          dataSource={groupedData}
          options={{
            density: false,
            setting: false,
            reload: false,
          }}
          search={false}
          pagination={false}
          columns={[
            {
              title: "来源",
              dataIndex: "associatedDataFrom",
              width: 200,
              render: (_, r) =>
                r.associatedDataFrom && (
                  <span>
                    {{ MySiteBlog: "我的站点/博客" }[_ as string] ?? _} (
                    {r.children?.length})
                  </span>
                ),
            },
            {
              title: "详细数据",
              dataIndex: "data",
              render: (_, r) => {
                return (
                  r.data && (
                    <ReactJson
                      src={_ as object}
                      theme="monokai"
                      shouldCollapse={({ name }) => name !== "root"}
                    />
                  )
                );
              },
            },
          ]}
        />
      </ProDescriptions>
    </FullPageContainer>
  );
};

export default BaseDetail;
