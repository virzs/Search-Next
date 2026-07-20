import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ProjectService } from "./project.service";
import { ProjectName } from "./schemas/ref-names";
import { DEFAULT_PROJECT_THEME_COLOR } from "./project.service";

describe("ProjectService", () => {
  let service: ProjectService;
  const projectModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getModelToken(ProjectName), useValue: projectModel },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("returns default site branding when no project exists", async () => {
    projectModel.findOne.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue(null),
    });

    const result = await service.publicDetail();

    expect(result.name).toBe("Search Next");
    expect(result.site).toEqual({ themeColor: DEFAULT_PROJECT_THEME_COLOR });
    expect(result).not.toHaveProperty("adminAccess");
    expect(result).not.toHaveProperty("release");
  });

  it("returns the common resource shape and excludes private settings", async () => {
    const icon = {
      _id: "507f1f77bcf86cd799439011",
      name: "favicon.png",
      key: "favicon.png",
      mimetype: "image/png",
      dir: "system-site",
      size: 128,
      url: "/static/system-site/favicon.png",
      service: "local",
    };
    projectModel.findOne.mockReturnValueOnce({
      exec: jest.fn().mockResolvedValue({
        toJSON: () => ({
          name: "Example",
          description: "Example project",
          login: { title: "Login", subTitle: "" },
          register: { allowRegister: true },
          turnstile: {
            enabled: true,
            siteKey: "public-site-key",
            secretKey: "private-secret",
          },
          adminAccess: { loginRoleIds: ["role-id"] },
          release: { repositoryUrl: "https://github.com/example/repo" },
          site: { icon, themeColor: "rgb(10, 20, 30)" },
        }),
      }),
    });

    const result = await service.publicDetail();

    expect(result.site).toEqual({ icon, themeColor: "rgb(10, 20, 30)" });
    expect(result.turnstile).toEqual({
      enabled: true,
      siteKey: "public-site-key",
    });
    expect(result).not.toHaveProperty("adminAccess");
    expect(result).not.toHaveProperty("release");
    expect(result.turnstile).not.toHaveProperty("secretKey");
  });
});
