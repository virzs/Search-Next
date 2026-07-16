import { NoticeService } from "./notice.service";

describe("NoticeService public notices", () => {
  it("includes createdAt for clients that need a display-date fallback", async () => {
    const notices = [{ _id: "notice-1", createdAt: new Date() }];
    const exec = jest.fn().mockResolvedValue(notices);
    const sort = jest.fn().mockReturnValue({ exec });
    const select = jest.fn().mockReturnValue({ sort });
    const find = jest.fn().mockReturnValue({ select });
    const service = new NoticeService({ find } as any);

    await expect(service.getAllForPublic("tabs")).resolves.toBe(notices);
    expect(select).toHaveBeenCalledWith(expect.stringContaining("createdAt"));
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
  });
});
