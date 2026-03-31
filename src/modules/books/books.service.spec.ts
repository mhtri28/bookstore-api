import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { PrismaService } from '../prisma/prisma.service';
import * as helper from 'src/shared/helpers/handle-prisma-error.helper';

describe('BooksService', () => {
  let service: BooksService;

  const authors = [
    { author_id: 1, name: 'Nam Cao' },
    { author_id: 2, name: 'Nguyễn Du' },
  ];

  const bookData = {
    book_id: 1,
    title: 'Đời thừa',
    price: 120000,
    stock: 20,
    image_url: null,
    category_id: 1,
    created_at: new Date(),
    updated_at: new Date(),
    bookAuthors: [{ author: authors[0] }, { author: authors[1] }],
    category: { category_id: 1, name: 'Văn học' },
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

  beforeEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();

    mockPrismaService.author.findMany.mockResolvedValue(authors);
    mockPrismaService.book.create.mockResolvedValue(bookData);
    mockPrismaService.book.findUnique.mockResolvedValue(bookData);
    mockPrismaService.book.update.mockResolvedValue(bookData);
    mockPrismaService.book.findMany.mockResolvedValue([bookData]);
    mockPrismaService.book.delete.mockResolvedValue(bookData);

    const module: TestingModule = await Test.createTestingModule({
      providers: [BooksService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  it('phải được khởi tạo', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      title: 'Đời thừa',
      price: 120000,
      stock: 20,
      category_id: 1,
      author_ids: [1, 2],
    };

    it('tạo sách thành công không có ảnh', async () => {
      const result = await service.create(createDto);

      expect(result).toEqual({ message: 'Tạo sách thành công', book: bookData });
      expect(mockPrismaService.author.findMany).toHaveBeenCalledWith({
        where: {
          author_id: { in: [1, 2] },
        },
      });
      expect(mockPrismaService.book.create).toHaveBeenCalledWith({
        data: {
          title: 'Đời thừa',
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

    it('tạo sách thành công với image_url từ filename', async () => {
      const file = { filename: 'book.jpg' } as Express.Multer.File;

      await service.create(createDto, file);

      expect(mockPrismaService.book.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            image_url: '/images/book.jpg',
          }),
        }),
      );
    });

    it('ném lỗi khi một hoặc nhiều tác giả không tồn tại', async () => {
      mockPrismaService.author.findMany.mockResolvedValueOnce([authors[0]]);

      await expect(service.create(createDto)).rejects.toThrow('Một hoặc nhiều tác giả không tồn tại');
    });

    it('gọi handlePrismaError khi tạo sách thất bại', async () => {
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
      title: 'Sống mòn',
      price: 140000,
      stock: 30,
      category_id: 2,
      author_ids: [2],
    };

    it('cập nhật sách thành công với ảnh và quan hệ tác giả mới', async () => {
      const file = { filename: 'book.jpg' } as Express.Multer.File;

      await service.update(1, updateDto, file);

      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { book_id: 1 },
        include: { bookAuthors: true },
      });
      expect(mockPrismaService.book.update).toHaveBeenCalledWith({
        where: { book_id: 1 },
        data: {
          title: 'Sống mòn',
          price: 140000,
          stock: 30,
          image_url: '/images/book.jpg',
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

    it('giữ nguyên ảnh cũ khi không truyền file mới', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce({
        ...bookData,
        image_url: 'old-image.jpg',
      });

      await service.update(1, { title: 'Tiêu đề mới' });

      expect(mockPrismaService.book.update).toHaveBeenCalledWith({
        where: { book_id: 1 },
        data: {
          title: 'Tiêu đề mới',
          price: undefined,
          stock: undefined,
          image_url: 'old-image.jpg',
        },
      });
    });

    it('ném lỗi khi sách không tồn tại', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

      await expect(service.update(99, updateDto)).rejects.toThrow('Sách không tồn tại');
    });

    it('gọi handlePrismaError khi cập nhật sách thất bại', async () => {
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
    it('trả về danh sách sách thành công', async () => {
      const result = await service.findAll();

      expect(result).toEqual({ message: 'Lấy danh sách sách thành công', books: [bookData] });
      expect(mockPrismaService.book.findMany).toHaveBeenCalledWith({
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

    it('gọi handlePrismaError khi lấy danh sách sách thất bại', async () => {
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
    it('trả về chi tiết một sách theo id', async () => {
      const result = await service.findOne(1);

      expect(result).toEqual({ message: 'Lấy chi tiết sách thành công', book: bookData });
      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { book_id: 1 },
      });
    });

    it('ném lỗi khi sách không tồn tại', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

      await expect(service.findOne(99)).rejects.toThrow('Sách không tồn tại');
    });
  });

  describe('remove', () => {
    it('xóa sách thành công', async () => {
      const result = await service.remove(1);

      expect(result).toEqual({ message: 'Xóa sách thành công', book: bookData });
      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
        where: { book_id: 1 },
      });
      expect(mockPrismaService.book.delete).toHaveBeenCalledWith({
        where: { book_id: 1 },
      });
    });

    it('ném lỗi khi xóa sách không tồn tại', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

      await expect(service.remove(99)).rejects.toThrow('Sách không tồn tại');
    });

    it('gọi handlePrismaError khi xóa sách thất bại', async () => {
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
    it('trả về danh sách tác giả theo book_id thành công', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce({
        book_id: 1,
        title: 'Đời thừa',
        bookAuthors: [{ author: authors[0] }, { author: authors[1] }],
      });

      const result = await service.getAuthorsByBook(1);

      expect(result).toEqual({
        message: 'Lấy danh sách tác giả của sách thành công',
        book_id: 1,
        title: 'Đời thừa',
        authors,
      });
      expect(mockPrismaService.book.findUnique).toHaveBeenCalledWith({
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

    it('ném lỗi khi sách không tồn tại', async () => {
      mockPrismaService.book.findUnique.mockResolvedValueOnce(null);

      await expect(service.getAuthorsByBook(99)).rejects.toThrow('Sách không tồn tại');
    });

    it('gọi handlePrismaError khi lấy tác giả theo sách thất bại', async () => {
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