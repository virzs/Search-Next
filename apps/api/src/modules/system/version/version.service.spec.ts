import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { VersionService } from "./version.service";
import { VersionName } from "./schemas/version";

describe("VersionService", () => {
  let service: VersionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VersionService,
        { provide: getModelToken(VersionName), useValue: {} },
      ],
    }).compile();

    service = module.get<VersionService>(VersionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
