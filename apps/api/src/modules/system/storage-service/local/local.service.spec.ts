import { Test, TestingModule } from '@nestjs/testing';
import { LocalService } from './local.service';
import { ConfigService } from '@nestjs/config';

describe('LocalService', () => {
  let service: LocalService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LocalService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              localStoragePath: './test-uploads',
              localStorageBaseUrl: 'http://localhost:3000/static',
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LocalService>(LocalService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should normalize mojibake filename to utf8', async () => {
    const original = '印度果阿邦_UHD-1qxaatxns6v.jpg';
    const mojibake = Buffer.from(original, 'utf8').toString('latin1');

    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: mojibake,
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 3,
      buffer: Buffer.from([1, 2, 3]),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    const res = await service.uploadFile('test', file);
    expect(res.name).toBe(original);
  });

  it('should keep utf8 filename as-is', async () => {
    const original = '中文文件名.jpg';

    const file: Express.Multer.File = {
      fieldname: 'file',
      originalname: original,
      encoding: '7bit',
      mimetype: 'image/jpeg',
      size: 3,
      buffer: Buffer.from([1, 2, 3]),
      destination: '',
      filename: '',
      path: '',
      stream: null as any,
    };

    const res = await service.uploadFile('test', file);
    expect(res.name).toBe(original);
  });
});
