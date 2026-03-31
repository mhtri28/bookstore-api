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
    jest.restoreAllMocks();
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthorsService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<AuthorsService>(AuthorsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });
  // Test riêng của mình
  describe('Lấy tác giả theo id', () => {
    it('trả về tác giả theo id', async () => {
      const result = await service.author({ author_id: 1 });

      expect(result).toEqual({ message: 'Lấy thông tin tác giả thành công', author: authorsArray[0] });
      expect(prismaService.author.findUnique).toHaveBeenCalledWith({
        where: { author_id: 1 },
      });
    });

    it('gọi handlePrismaError khi lấy tác giả thất bại', async () => {
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

  describe('Lấy danh sách tác giả', () => {
    it('trả về danh sách tác giả mặc định', async () => {
      const result = await service.authors({});

      expect(result).toEqual({ message: 'Lấy danh sách tác giả thành công', authors: authorsArray });
      expect(prismaService.author.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined,
        orderBy: { created_at: 'desc' },
      });
    });

    it('trả về danh sách tác giả theo bộ lọc và sắp xếp', async () => {
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

    it('gọi handlePrismaError khi lấy danh sách thất bại', async () => {
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

  describe('Tạo tác giả', () => {
    it('tạo tác giả mới', async () => {
      const author = await service.create({
        name: 'Hồ Xuân Hương',
      });

      expect(author).toEqual({ message: 'Tạo tác giả thành công', author: authorData });
      expect(prismaService.author.create).toHaveBeenCalledWith({ data: { name: 'Hồ Xuân Hương' } });
    });

    it('gọi handlePrismaError khi tạo thất bại', async () => {
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

  describe('Cập nhật tác giả', () => {
    it('cập nhật tác giả', async () => {
      const params = {
        where: { author_id: 1 },
        data: { name: 'Nam Cao' },
      };

      const result = await service.updateAuthor(params);

      expect(result).toEqual({ message: 'Cập nhật tác giả thành công', author: authorData });
      expect(prismaService.author.update).toHaveBeenCalledWith({
        where: { author_id: 1 },
        data: { name: 'Nam Cao' },
      });
    });

    it('gọi handlePrismaError khi cập nhật thất bại', async () => {
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

  describe('Xóa tác giả', () => {
    it('xóa tác giả', async () => {
      const result = await service.deleteAuthor({ author_id: 1 });

      expect(result).toEqual({ message: 'Xóa tác giả thành công', author: authorData });
      expect(prismaService.author.delete).toHaveBeenCalledWith({
        where: { author_id: 1 },
      });
    });

    it('gọi handlePrismaError khi xóa thất bại', async () => {
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
