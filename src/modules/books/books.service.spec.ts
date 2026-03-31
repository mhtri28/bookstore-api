import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import * as helper from 'src/shared/helpers/handle-prisma-error.helper';
import { NotFoundException } from '@nestjs/common';

describe('BooksService', () => {
  let service: BooksService;
  let prismaService: PrismaService;
  let cloudinaryService: CloudinaryService;

  const uploadResult = {
    secure_url: 'https://res.cloudinary.com/demo/image/upload/book.jpg',
  };

  const authors = [
    { author_id: 1, name: 'Nam Cao' },
    { author_id: 2, name: 'Nguyen Du' },
  ];

  const bookData = {
    book_id: 1,
    title: 'Doi thua',
    price: 120000,
    stock: 20,
    image_url: null,
    category_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    bookAuthors: [{ author: authors[0] }, { author: authors[1] }],
    category: { category_id: 1, name: 'Van hoc' },
  };

  const mockPrismaService = {
    author: {
      findMany: jest.fn(),
    },
    book: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCloudinaryService = {
    uploadImage: jest.fn(),
  };

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    mockPrismaService.author.findMany.mockResolvedValue(authors);
    mockPrismaService.book.create.mockResolvedValue(bookData);
    mockPrismaService.book.findUnique.mockResolvedValue(bookData);
    mockPrismaService.book.update.mockResolvedValue(bookData);
    mockPrismaService.book.findMany.mockResolvedValue([bookData]);
    mockPrismaService.book.delete.mockResolvedValue(bookData);
    mockCloudinaryService.uploadImage.mockResolvedValue(uploadResult);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: CloudinaryService, useValue: mockCloudinaryService },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
    prismaService = module.get<PrismaService>(PrismaService);
    cloudinaryService = module.get<CloudinaryService>(CloudinaryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      title: 'Doi thua',
      price: 120000,
      stock: 20,
      category_id: 1,
      author_ids: [1, 2],
    };

    it('should create a book without image', async () => {
      const result = await service.create(createDto);

      expect(result).toEqual(bookData);
      expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(prismaService.author.findMany).toHaveBeenCalledWith({
        where: {
          author_id: { in: [1, 2] },
        },
      });
      expect(prismaService.book.create).toHaveBeenCalledWith({
        data: {
          title: 'Doi thua',
          price: 120000,
          stock: 20,
          image_url: null,
          category: {
            connect: { category_id: 1 },
          },
          bookAuthors: {
            create: [{ author: { connect: { author_id: 1 } } }, { author: { connect: { author_id: 2 } } }],
          },
        },
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
          category: true,
        },
      });
    });

    it('should upload image and create book with image url', async () => {
      const file = { buffer: Buffer.from('img') } as Express.Multer.File;

      await service.create(createDto, file);

      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      expect(prismaService.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            image_url: uploadResult.secure_url,
          }),
        }),
      );
    });

    it('should throw not found when one or many authors do not exist', async () => {
      mockPrismaService.author.findMany.mockResolvedValueOnce([authors[0]]);

      await expect(service.create(createDto)).rejects.toThrow('Một hoặc nhiều tác giả không tồn tại');
    });

    it('should call handlePrismaError when create fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.book.create.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.create(createDto)).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        foreignKeyMessage: 'Danh mục hoặc tác giả không tồn tại',
        defaultMessage: 'Tạo sách thất bại',
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Song mon',
      price: 140000,
      stock: 30,
      category_id: 2,
      author_ids: [2],
    };

    it('should update a book with image and relations', async () => {
      const file = { buffer: Buffer.from('img') } as Express.Multer.File;

      await service.update(1, updateDto, file);

      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { book_id: 1 },
        include: { bookAuthors: true },
      });
      expect(cloudinaryService.uploadImage).toHaveBeenCalledWith(file);
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { book_id: 1 },
        data: {
          title: 'Song mon',
          price: 140000,
          stock: 30,
          image_url: uploadResult.secure_url,
          category: {
            connect: { category_id: 2 },
          },
          bookAuthors: {
            deleteMany: {},
            create: [{ author: { connect: { author_id: 2 } } }],
          },
        },
      });
    });

    it('should keep existing image when no file provided', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce({
        ...bookData,
        image_url: 'old-image',
      });

      await service.update(1, { title: 'Updated title' });

      expect(cloudinaryService.uploadImage).not.toHaveBeenCalled();
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { book_id: 1 },
        data: {
          title: 'Updated title',
          price: undefined,
          stock: undefined,
          image_url: 'old-image',
        },
      });
    });

    it('should throw not found when book does not exist', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

      await expect(service.update(99, updateDto)).rejects.toThrow('Sách không tồn tại');
    });

    it('should call handlePrismaError when update fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.book.update.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.update(1, { title: 'Test' })).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        notFoundMessage: 'Sách không tồn tại',
        foreignKeyMessage: 'Danh mục hoặc tác giả không tồn tại',
        defaultMessage: 'Cập nhật sách thất bại',
      });
    });
  });

  describe('findAll', () => {
    it('should return books list', async () => {
      const result = await service.findAll();

      expect(result).toEqual([bookData]);
      expect(prismaService.book.findMany).toHaveBeenCalledWith({
        include: {
          bookAuthors: {
            include: {
              author: true,
            },
          },
          category: true,
        },
        orderBy: { created_at: 'desc' },
      });
    });

    it('should call handlePrismaError when findAll fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.book.findMany.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.findAll()).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        defaultMessage: 'Lấy danh sách sách thất bại',
      });
    });
  });

  describe('findOne', () => {
    it('should return one book by id', async () => {
      const result = await service.findOne(1);

      expect(result).toEqual(bookData);
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { book_id: 1 },
      });
    });

    it('should throw not found when book does not exist', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(99)).rejects.toThrow('Sách không tồn tại');
    });
  });

  describe('remove', () => {
    it('should delete a book', async () => {
      const result = await service.remove(1);

      expect(result).toEqual(bookData);
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { book_id: 1 },
      });
      expect(prismaService.book.delete).toHaveBeenCalledWith({
        where: { book_id: 1 },
      });
    });

    it('should throw not found when deleting non-existing book', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove(99)).rejects.toThrow('Sách không tồn tại');
    });

    it('should call handlePrismaError when remove fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.book.delete.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.remove(1)).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        notFoundMessage: 'Sách không tồn tại',
        defaultMessage: 'Xóa sách thất bại',
      });
    });
  });

  describe('getAuthorsByBook', () => {
    it('should return authors by book id', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce({
        book_id: 1,
        title: 'Doi thua',
        bookAuthors: [{ author: authors[0] }, { author: authors[1] }],
      });

      const result = await service.getAuthorsByBook(1);

      expect(result).toEqual({
        book_id: 1,
        title: 'Doi thua',
        authors,
      });
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { book_id: 1 },
        select: {
          book_id: true,
          title: true,
          bookAuthors: {
            select: {
              author: {
                select: {
                  author_id: true,
                  name: true,
                },
              },
            },
          },
        },
      });
    });

    it('should throw not found when book does not exist', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

      await expect(service.getAuthorsByBook(99)).rejects.toThrow('Sách không tồn tại');
    });

    it('should call handlePrismaError when getAuthorsByBook fails', async () => {
      const dbError = new Error('DB error');
      const handledError = new Error('Handled error');

      mockPrismaService.book.findUnique.mockRejectedValueOnce(dbError);
      const handleSpy = jest.spyOn(helper, 'handlePrismaError').mockImplementation(() => {
        throw handledError;
      });

      await expect(service.getAuthorsByBook(1)).rejects.toThrow(handledError);
      expect(handleSpy).toHaveBeenCalledWith(dbError, {
        notFoundMessage: 'Sách không tồn tại',
        defaultMessage: 'Lấy danh sách tác giả của sách thất bại',
      });
    });
  });
});
