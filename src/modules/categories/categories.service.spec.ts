import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import * as helper from 'src/shared/helpers/handle-prisma-error.helper';
import { CommonStatus } from 'src/generated/prisma/enums';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: PrismaService;

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
      findUnique: jest.fn().mockResolvedValue(categoriesArray[0]),
      findMany: jest.fn().mockResolvedValue(categoriesArray),
      create: jest.fn().mockResolvedValue(categoryData),
      update: jest.fn().mockResolvedValue(categoryData),
      delete: jest.fn().mockResolvedValue(categoryData),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Get Category By Id', () => {
    it('should return one category by unique input', async () => {
      const result = await service.category({ category_id: 1 });

      expect(result).toEqual(categoriesArray[0]);
      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { category_id: 1 },
      });
    });

    it('should call handlePrismaError when findUnique fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.category, 'findUnique').mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.category({ category_id: 1 })).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Lấy thông tin danh mục thất bại',
      });
    });
  });

  describe('Get Categories List', () => {
    it('should return categories list with default order', async () => {
      const result = await service.categories({});

      expect(result).toEqual(categoriesArray);
      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        skip: undefined,
        take: undefined,
        where: undefined,
        orderBy: { created_at: 'desc' },
      });
    });

    it('should return categories list with filter and custom order', async () => {
      const query = {
        skip: 0,
        take: 10,
        name: 'Văn',
        description: 'Việt Nam',
        orderBy: 'name',
        sortOrder: 'asc' as const,
      };

      await service.categories(query);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: {
          name: {
            contains: 'Văn',
          },
          description: {
            contains: 'Việt Nam',
          },
        },
        orderBy: { name: 'asc' },
      });
    });

    it('should call handlePrismaError when findMany fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.category, 'findMany').mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.categories({})).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Lấy danh sách danh mục thất bại',
      });
    });
  });

  describe('Create Category', () => {
    it('should create a new category', async () => {
      const category = await service.create({
        name: 'Văn học',
        description: 'Sách văn học Việt Nam',
      });

      expect(category).toEqual(categoryData);
      expect(prismaService.category.create).toHaveBeenCalledWith({
        data: {
          name: 'Văn học',
          description: 'Sách văn học Việt Nam',
        },
      });
    });

    it('should handle error when create fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.category, 'create').mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.create({ name: 'Test' })).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        uniqueMessage: 'Danh mục đã tồn tại',
        defaultMessage: 'Tạo danh mục thất bại',
      });
    });
  });

  describe('Update Category', () => {
    it('should update a category', async () => {
      const params = {
        where: { category_id: 1 },
        data: { name: 'Văn học hiện đại' },
      };

      const result = await service.updateCategory(params);

      expect(result).toEqual(categoryData);
      expect(prismaService.category.update).toHaveBeenCalledWith({
        where: { category_id: 1 },
        data: { name: 'Văn học hiện đại' },
      });
    });

    it('should call handlePrismaError when update fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.category, 'update').mockRejectedValueOnce(dbError);
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

  describe('Delete Category', () => {
    it('should delete a category', async () => {
      const result = await service.deleteCategory({ category_id: 1 });

      expect(result).toEqual(categoryData);
      expect(prismaService.category.delete).toHaveBeenCalledWith({
        where: { category_id: 1 },
      });
    });

    it('should call handlePrismaError when delete fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      jest.spyOn(prismaService.category, 'delete').mockRejectedValueOnce(dbError);
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
