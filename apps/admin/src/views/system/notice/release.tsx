import { ReleasePublicationPage } from "./release-publication";

const ReleaseNotice = () => (
  <ReleasePublicationPage
    components={["web", "admin"]}
    title="版本公告"
    description="手动部署完成后，从 GitHub Release 生成并发布 Web 或 Admin 更新公告。"
  />
);

export default ReleaseNotice;
