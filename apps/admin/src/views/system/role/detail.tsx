import { detailRole } from "@/services/system/role";
import { findChildren } from "@/utils/utils";
import { useRequest } from "ahooks";
import { Tree } from "antd";
import { useEffect, useMemo } from "react";
import { useParams } from "react-router";
import { Typography } from "antd";
import { ProCard } from "@ant-design/pro-components";
import FullPageContainer from "@/components/containter/full";

const { Title, Paragraph } = Typography;

const RoleDetail = () => {
  const { id } = useParams();

  const {
    data = {},
    loading,
    run,
  } = useRequest(detailRole, {
    manual: true,
  });

  const { permissions = [] } = data;

  //   将 permissions 按 parent 转为树形结构，递归循环
  const treeData = useMemo(() => {
    return findChildren(permissions);
  }, [permissions]);

  useEffect(() => {
    if (id) {
      run(id);
    }
  }, [id]);

  return (
    <FullPageContainer loading={loading}>
      <ProCard loading={loading}>
        <Title level={2}>{data?.name}</Title>
        <Paragraph>{data?.description}</Paragraph>
        <Tree
          treeData={treeData}
          titleRender={(r) => {
            return r.name;
          }}
        />
      </ProCard>
    </FullPageContainer>
  );
};

export default RoleDetail;
