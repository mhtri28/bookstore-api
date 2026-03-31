import { Test, TestingModule } from '@nestjs/testing';
import { AuthorsService } from './authors.service';
import { PrismaService } from '../prisma/prisma.service';
import * as helper from 'src/shared/helpers/handle-prisma-error.helper';
import { CommonStatus } from 'src/generated/prisma/enums';

describe('AuthorsService', () => {
  let service: AuthorsService;

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

  const authorData = {
    author_id: 1,
    name: 'Hồ Xuân Hương',
    status: CommonStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPrismaService = {
    author: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthorsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
  });

  it('phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('tạo tác giả thành công', async () => {
      mockPrismaService.author.create.mockResolvedValue(authorData);

      const result = await service.create({ name: 'Hồ Xuân Hương' });

      expect(result).toEqual({ message: 'Tạo tác giả thành công', author: authorData });
      expect(mockPrismaService.author.create).toHaveBeenCalledWith({
        data: { name: 'Hồ Xuân Hương' },
      });
    });

    it('gọi handlePrismaError khi tạo thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.author.create.mockRejectedValueOnce(dbError);
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

  describe('authors', () => {
    it('trả về danh sách tác giả mặc định', async () => {
      mockPrismaService.author.findMany.mockResolvedValue(authorsArray);

      const result = await service.authors({});

      expect(result).toEqual({ message: 'Lấy danh sách tác giả thành công', authors: authorsArray });
      expect(mockPrismaService.author.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined,
        orderBy: { created_at: 'desc' },
      });
    });

    it('trả về danh sách tác giả theo bộ lọc và sắp xếp', async () => {
      mockPrismaService.author.findMany.mockResolvedValue(authorsArray);

      const query = {
        skip: 0,
        take: 10,
        name: 'Nguyễn',
        orderBy: 'name',
        sortOrder: 'asc' as const,
      };

      await service.authors(query);

      expect(mockPrismaService.author.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { name: { contains: 'Nguyễn' } },
        orderBy: { name: 'asc' },
      });
    });

    it('gọi handlePrismaError khi lấy danh sách thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.author.findMany.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.authors({})).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Lấy danh sách tác giả thất bại',
      });
    });
  });

  describe('author', () => {
    it('trả về chi tiết một tác giả theo id', async () => {
      mockPrismaService.author.findUnique.mockResolvedValue(authorsArray[0]);

      const result = await service.author({ author_id: 1 });

      expect(result).toEqual({ message: 'Lấy thông tin tác giả thành công', author: authorsArray[0] });
      expect(mockPrismaService.author.findUnique).toHaveBeenCalledWith({
        where: { author_id: 1 },
      });
    });

    it('gọi handlePrismaError khi lấy chi tiết tác giả thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.author.findUnique.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.author({ author_id: 1 })).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Lấy thông tin tác giả thất bại',
      });
    });
  });

  describe('updateAuthor', () => {
    it('cập nhật tác giả thành công', async () => {
      mockPrismaService.author.update.mockResolvedValue(authorData);

      const result = await service.updateAuthor({
        where: { author_id: 1 },
        data: { name: 'Nam Cao' },
      });

      expect(result).toEqual({ message: 'Cập nhật tác giả thành công', author: authorData });
      expect(mockPrismaService.author.update).toHaveBeenCalledWith({
        where: { author_id: 1 },
        data: { name: 'Nam Cao' },
      });
    });

    it('gọi handlePrismaError khi cập nhật thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.author.update.mockRejectedValueOnce(dbError);
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

  describe('deleteAuthor', () => {
    it('xóa tác giả thành công', async () => {
      mockPrismaService.author.delete.mockResolvedValue(authorData);

      const result = await service.deleteAuthor({ author_id: 1 });

      expect(result).toEqual({ message: 'Xóa tác giả thành công', author: authorData });
      expect(mockPrismaService.author.delete).toHaveBeenCalledWith({
        where: { author_id: 1 },
      });
    });

    it('gọi handlePrismaError khi xóa thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.author.delete.mockRejectedValueOnce(dbError);
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