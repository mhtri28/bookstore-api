import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { PrismaService } from '../prisma/prisma.service';
import * as helper from 'src/shared/helpers/handle-prisma-error.helper';
import { CommonStatus } from 'src/generated/prisma/enums';

describe('AuthorsService', () => {
  let service: AuthorsService;
  let prismaService: PrismaService;

  // Tạo để test findMany và findUnique
  const authorsArray = [
    {
      author_id: 1,
      name: 'Hồ Xuân Hương',
      status: CommonStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      author_id: 2,
      name: 'Nam Cao',
      status: CommonStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      author_id: 3,
      name: 'Nguyễn Du',
      status: CommonStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];
  // Tạo để test mấy cái create, update và delete
  const authorData = {
    author_id: 1,
    name: 'Hồ Xuân Hương',
    status: CommonStatus.ACTIVE,
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
    jest.clearAllMocks();

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
  describe('Get Author By Id', () => {
    it('should return one author by unique input', async () => {
      const result = await service.author({ author_id: 1 });

      expect(result).toEqual(authorsArray[0]);
      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { author_id: 1 },
      });
    });

    it('should call handlePrismaError when findUnique fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.author, 'findUnique').mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.author({ author_id: 1 })).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Lấy thông tin tác giả thất bại',
      });
    });
  });

  describe('Get Authors List', () => {
    it('should return authors list with default order', async () => {
      const result = await service.authors({});

      expect(result).toEqual(authorsArray);
      expect(prismaService.author.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined,
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return authors list with filter and custom order', async () => {
      const query = {
        skip: 0,
        take: 10,
        name: 'Nguyễn',
        orderBy: 'name',
        sortOrder: 'asc' as const,
      };

      await service.authors(query);

      expect(prismaService.author.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          name: {
            contains: 'Nguyễn',
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should call handlePrismaError when findMany fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.author, 'findMany').mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.authors({})).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Lấy danh sách tác giả thất bại',
      });
    });
  });

  describe('Create Author', () => {
    it('should create a new author', async () => {
      const author = await service.create({
        name: 'Hồ Xuân Hương',
      });

      expect(author).toEqual(authorData);
      expect(prismaService.author.create).toHaveBeenCalledWith({ data: { name: 'Hồ Xuân Hương' } });
    });

    it('should handle error when create fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.author, 'create').mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.create({ name: 'Test' })).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        uniqueMessage: 'Tác giả đã tồn tại',
        defaultMessage: 'Tạo tác giả thất bại',
      });
    });
  });

  describe('Update Author', () => {
    it('should update an author', async () => {
      const params = {
        where: { author_id: 1 },
        data: { name: 'Nam Cao' },
      };

      const result = await service.updateAuthor(params);

      expect(result).toEqual(authorData);
      expect(prismaService.author.update).toHaveBeenCalledWith({
        where: { author_id: 1 },
        data: { name: 'Nam Cao' },
      });
    });

    it('should call handlePrismaError when update fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.author, 'update').mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(
        service.updateAuthor({
          where: { author_id: 1 },
          data: { name: 'Test' },
        }),
      ).rejects.toThrow(handledError);

      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        notFoundMessage: 'Tác giả không tồn tại',
        uniqueMessage: 'Tác giả đã tồn tại',
        defaultMessage: 'Cập nhật tác giả thất bại',
      });
    });
  });

  describe('Delete Author', () => {
    it('should delete an author', async () => {
      const result = await service.deleteAuthor({ author_id: 1 });

      expect(result).toEqual(authorData);
      expect(prismaService.author.delete).toHaveBeenCalledWith({
        where: { author_id: 1 },
      });
    });

    it('should call handlePrismaError when delete fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.author, 'delete').mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.deleteAuthor({ author_id: 1 })).rejects.toThrow(handledError);

      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        notFoundMessage: 'Tác giả không tồn tại',
        defaultMessage: 'Xóa tác giả thất bại',
      });
    });
  });
});
