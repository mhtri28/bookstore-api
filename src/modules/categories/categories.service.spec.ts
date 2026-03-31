import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import * as helper from 'src/shared/helpers/handle-prisma-error.helper';
import { CommonStatus } from 'src/generated/prisma/enums';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const categoriesArray = [
    {
      category_id: 1,
      name: 'Văn học',
      description: 'Sách văn học Việt Nam',
      status: CommonStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      category_id: 2,
      name: 'Kinh tế',
      description: 'Sách về tài chính, kinh doanh',
      status: CommonStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      category_id: 3,
      name: 'Thiếu nhi',
      description: 'Sách cho trẻ em',
      status: CommonStatus.ACTIVE,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const categoryData = {
    category_id: 1,
    name: 'Văn học',
    description: 'Sách văn học Việt Nam',
    status: CommonStatus.ACTIVE,
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockPrismaService = {
    category: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('tạo danh mục thành công', async () => {
      mockPrismaService.category.create.mockResolvedValue(categoryData);

      const result = await service.create({
        name: 'Văn học',
        description: 'Sách văn học Việt Nam',
      });

      expect(result).toEqual(categoryData);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Văn học',
          description: 'Sách văn học Việt Nam',
        },
      });
    });

    it('gọi handlePrismaError khi tạo thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.category.create.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.create({ name: 'Test' } as any)).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        uniqueMessage: 'Danh mục đã tồn tại',
        defaultMessage: 'Tạo danh mục thất bại',
      });
    });
  });

  describe('categories', () => {
    it('trả về danh sách danh mục mặc định', async () => {
      mockPrismaService.category.findMany.mockResolvedValue(categoriesArray);

      const result = await service.categories({});

      expect(result).toEqual(categoriesArray);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined,
        orderBy: { created_at: 'desc' },
      });
    });

    it('trả về danh sách danh mục theo bộ lọc và sắp xếp', async () => {
      mockPrismaService.category.findMany.mockResolvedValue(categoriesArray);

      const query = {
        skip: 0,
        take: 10,
        name: 'Văn',
        description: 'Việt Nam',
        orderBy: 'name',
        sortOrder: 'asc' as const,
      };

      await service.categories(query);

      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          name: { contains: 'Văn' },
          description: { contains: 'Việt Nam' },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('gọi handlePrismaError khi lấy danh sách thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.category.findMany.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.categories({})).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Lấy danh sách danh mục thất bại',
      });
    });
  });

  describe('category', () => {
    it('trả về chi tiết một danh mục theo id', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(categoriesArray[0]);

      const result = await service.category({ category_id: 1 });

      expect(result).toEqual(categoriesArray[0]);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { category_id: 1 },
      });
    });

    it('gọi handlePrismaError khi lấy chi tiết thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.category.findUnique.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.category({ category_id: 1 })).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Lấy thông tin danh mục thất bại',
      });
    });
  });

  describe('updateCategory', () => {
    it('cập nhật danh mục thành công', async () => {
      mockPrismaService.category.update.mockResolvedValue(categoryData);

      const result = await service.updateCategory({
        where: { category_id: 1 },
        data: { name: 'Văn học hiện đại' },
      });

      expect(result).toEqual(categoryData);
      expect(mockPrismaService.category.update).toHaveBeenCalledWith({
        where: { category_id: 1 },
        data: { name: 'Văn học hiện đại' },
      });
    });

    it('gọi handlePrismaError khi cập nhật thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.category.update.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(
        service.updateCategory({
          where: { category_id: 1 },
          data: { name: 'Test' },
        }),
      ).rejects.toThrow(handledError);

      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        notFoundMessage: 'Danh mục không tồn tại',
        uniqueMessage: 'Danh mục đã tồn tại',
        defaultMessage: 'Cập nhật danh mục thất bại',
      });
    });
  });

  describe('deleteCategory', () => {
    it('xóa danh mục thành công', async () => {
      mockPrismaService.category.delete.mockResolvedValue(categoryData);

      const result = await service.deleteCategory({ category_id: 1 });

      expect(result).toEqual(categoryData);
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { category_id: 1 },
      });
    });

    it('gọi handlePrismaError khi xóa thất bại', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.category.delete.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.deleteCategory({ category_id: 1 })).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        notFoundMessage: 'Danh mục không tồn tại',
        defaultMessage: 'Xóa danh mục thất bại',
      });
    });
  });
});