import DefaultDTOValidationPipe from "src/public/pipe/dtoValid";
import { ProjectDto } from "./dto/project.dto";

describe("ProjectDto site branding", () => {
  const pipe = new DefaultDTOValidationPipe();
  const metadata = { type: "body" as const, metatype: ProjectDto };

  it("accepts the common resource shape and RGB theme colors", async () => {
    await expect(
      pipe.transform(
        {
          name: "Search Next",
          site: {
            themeColor: "rgb(10, 20, 30)",
            icon: {
              _id: "507f1f77bcf86cd799439011",
              name: "favicon.png",
              key: "favicon.png",
              mimetype: "image/png",
              dir: "system-site",
              size: 128,
              url: "/static/system-site/favicon.png",
              service: "local",
            },
          },
        },
        metadata,
      ),
    ).resolves.toMatchObject({
      site: {
        themeColor: "rgb(10,20,30)",
        icon: { name: "favicon.png", mimetype: "image/png" },
      },
    });
  });

  it("rejects invalid theme colors", async () => {
    await expect(
      pipe.transform(
        {
          name: "Search Next",
          site: { themeColor: "not-a-color" },
        },
        metadata,
      ),
    ).rejects.toThrow("Validation failed");
  });
});
