import { Test, TestingModule } from "@nestjs/testing";
import { getModelToken } from "@nestjs/mongoose";
import { ProjectService } from "./project.service";
import { ProjectName } from "./schemas/ref-names";

describe("ProjectService", () => {
  let service: ProjectService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectService,
        { provide: getModelToken(ProjectName), useValue: {} },
      ],
    }).compile();

    service = module.get<ProjectService>(ProjectService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });
});
