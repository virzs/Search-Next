import { NoticeController } from "./notice.controller";

describe("NoticeController inbox", () => {
  it("requires login but skips role permission checks", async () => {
    const noticeService = {
      inbox: jest.fn().mockResolvedValue([]),
    };
    const controller = new NoticeController(noticeService as any);

    expect(
      Reflect.getMetadata("skip-permission", NoticeController.prototype.inbox),
    ).toBe(true);
    await expect(controller.inbox("admin")).resolves.toEqual([]);
    expect(noticeService.inbox).toHaveBeenCalledWith("admin");
  });
});
