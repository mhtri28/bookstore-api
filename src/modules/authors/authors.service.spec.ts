import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let prismaService: PrismaService;
  // Tạo để test findMany và findUnique
  const authorsArray = [
    {
      id: 1,
      name: 'Hồ Xuân Hương',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 2,
      name: 'Nam Cao',
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      id: 3,
      name: 'Nguyễn Du',
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  // Tạo để test mấy cái create, update và delete
  const authorData = {
    id: 1,
    name: 'Hồ Xuân Hương',
    created_at: new Date(),
    updated_at: new Date(),
  };
  const mockPrismaService = {
    author: {
      findUnique: jest.fn().mockResolvedValue(authorsArray[0]),
      findMany: jest.fn().mockResolvedValue(authorsArray),
      create: jest.fn().mockResolvedValue(authorData),
      update: jest.fn().mockResolvedValue(authorData),
      delete: jest.fn().mockResolvedValue(authorData),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test riêng của mình

  describe('author', () => {});

  describe('authors', () => {});
});
