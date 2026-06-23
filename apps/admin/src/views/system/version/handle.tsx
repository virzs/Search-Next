import { baseFormItemLayout } from "@/utils/utils";
import { RollbackOutlined } from "@ant-design/icons";
import { BetaSchemaForm, ProCard, ProFormInstance } from "@ant-design/pro-components";
import { Button, Space, message } from "antd";
import { useNavigate, useParams } from "react-router";
import { useRequest } from "ahooks";
import { detailVersion, getLatestVersion, postVersion, putVersion } from "@/services/system/version";
import { useEffect, useRef } from "react";
import { platformAcceptDicMap, platformDicMap, updateTypeDicMap } from "./dic";
import { format } from "date-fns";
import FullPageContainer from "@/components/containter/full";

const VersionHandle = () => {
  const ref = useRef<ProFormInstance>();

  const { id } = useParams();
  const navigate = useNavigate();

  const { data: latest, run: latestRun } = useRequest(getLatestVersion, {
    manual: true,
  });

  const { run } = useRequest(detailVersion, {
    manual: true,
    onSuccess: (data) => {
      ref.current?.setFieldsValue({
        ...data,
        content: JSON.parse(data.content),
        updateType: data.updateType + "",
      });
    },
  });

  useEffect(() => {
    if (id) return;
    const latestArr = latest?.version?.split("-") ?? [];
    const suffixDate = format(new Date(), "yyMMdd");
    const v = `${latestArr?.[0] || "0.0.0"}-${suffixDate}-${(Number(latestArr[2]) || 0) + 1}`;
    ref.current?.setFieldsValue({
      version: v,
    });
  }, [latest, id]);

  useEffect(() => {
    if (id) {
      run(id);
    } else {
      latestRun({ platform: "all" });
    }
  }, [id]);

  return (
    <FullPageContainer>
      <div className="max-w-6xl mx-auto py-10">
        <BetaSchemaForm
          {...baseFormItemLayout}
          formRef={ref}
          submitter={{
            searchConfig: {
              submitText: "保存",
            },
            render(_, dom) {
              return <div className="flex items-center justify-center gap-2">{...dom}</div>;
            },
          }}
          onFinish={(values) => {
            return new Promise((resolve) => {
              const p = {
                ...values,
                content: JSON.stringify(values.content),
              };

              (id ? putVersion(id, p) : postVersion(p))
                .then(() => {
                  message.success(id ? "修改成功" : "新增成功");
                  resolve(true);
                  ref.current?.resetFields();
                  navigate(-1);
                })
                .catch(() => {
                  resolve(false);
                });
            });
          }}
          columns={[
            {
              title: "版本号",
              dataIndex: "version",
              valueType: "text",
              formItemProps: {
                rules: [
                  {
                    required: true,
                    message: "版本号不能为空",
                  },
                ],
              },
            },
            {
              title: "更新信息",
              dataIndex: "platforms",
              valueType: "formList",
              initialValue: [{}],
              fieldProps: {
                max: Object.keys(platformDicMap).length,
                alwaysShowItemLabel: true,
                copyIconProps: false,
                creatorButtonProps: {
                  creatorButtonText: "新增更新信息",
                },
                itemRender: ({ listDom, action }: any) => {
                  return (
                    <ProCard className="mb-2" size="small" bordered extra={action}>
                      {listDom}
                    </ProCard>
                  );
                },
                rules: [
                  {
                    required: true,
                    message: "更新信息不能为空",
                  },
                ],
              },
              columns: [
                {
                  valueType: "dependency",
                  name: ["platform"],
                  columns: ({ platform }) => {
                    const accept = platformAcceptDicMap[platform] ?? "";

                    return [
                      {
                        title: "发布平台",
                        dataIndex: "platform",
                        valueType: "select",
                        valueEnum: platformDicMap,
                        formItemProps: {
                          ...baseFormItemLayout,
                          rules: [
                            {
                              required: true,
                              message: "发布平台不能为空",
                            },
                            // 根据 platforms 判断 platform 不能重复
                            {
                              validator: async (_, value) => {
                                const platforms = ref.current?.getFieldValue("platforms") || [];
                                const index = platforms.filter((item: any) => item.platform === value).length;
                                if (index > 1) {
                                  return Promise.reject("发布平台不能重复");
                                }
                                return Promise.resolve();
                              },
                            },
                          ],
                        },
                        fieldProps: {
                          onChange: (v: string) => {
                            latestRun({ platform: v });
                          },
                        },
                      },
                      {
                        title: "更新方式",
                        dataIndex: "updateType",
                        valueType: "select",
                        valueEnum: updateTypeDicMap,
                        dependencies: ["platforms", "platform"],
                        formItemProps: {
                          ...baseFormItemLayout,
                          rules: [
                            {
                              required: true,
                              message: "更新方式不能为空",
                            },
                          ],
                        },
                        fieldProps: {
                          disabled: accept === "",
                        },
                      },
                      {
                        title: "安装包",
                        dataIndex: "source",
                        valueType: "upload",
                        fieldProps: {
                          maxCount: 1,
                          dir: "version",
                          accept: accept,
                          disabled: accept === "",
                        },
                        formItemProps: {
                          ...baseFormItemLayout,
                          rules: [
                            {
                              required: true,
                              message: "安装包不能为空",
                            },
                          ],
                        },
                      },
                    ];
                  },
                },
              ],
            },
            {
              title: "更新内容",
              dataIndex: "content",
              valueType: "editor",
              formItemProps: {
                rules: [
                  {
                    required: true,
                    message: "更新内容不能为空",
                  },
                ],
              },
            },
            {
              title: "发布时间",
              dataIndex: "releaseTime",
              valueType: "dateTime",
            },
          ]}
        />
      </div>
    </FullPageContainer>
  );
};

export default VersionHandle;
