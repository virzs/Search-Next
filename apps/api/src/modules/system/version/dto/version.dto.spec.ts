import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { VersionDto } from "./version.dto";

const createDto = (platforms: Array<Record<string, unknown>>) =>
  plainToInstance(VersionDto, {
    version: "1.2.3",
    platforms,
    content: "Release notes",
  });

describe("VersionDto", () => {
  it("accepts a single platform", async () => {
    const errors = await validate(
      createDto([
        {
          platform: "windows",
          updateType: 2,
          source: { _id: "resource-id" },
        },
      ]),
    );

    expect(errors).toHaveLength(0);
  });

  it("rejects publishing multiple platforms at once", async () => {
    const errors = await validate(
      createDto([
        {
          platform: "windows",
          updateType: 2,
          source: { _id: "windows-resource" },
        },
        {
          platform: "mac",
          updateType: 2,
          source: { _id: "mac-resource" },
        },
      ]),
    );

    expect(errors).toEqual([
      expect.objectContaining({
        property: "platforms",
        constraints: expect.objectContaining({
          arrayMaxSize: "每次只能发布一个平台",
        }),
      }),
    ]);
  });
});
