-- DropForeignKey
ALTER TABLE `bookauthor` DROP FOREIGN KEY `BookAuthor_author_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookauthor` DROP FOREIGN KEY `BookAuthor_book_id_fkey`;

-- DropIndex
DROP INDEX `BookAuthor_author_id_fkey` ON `bookauthor`;

-- AddForeignKey
ALTER TABLE `BookAuthor` ADD CONSTRAINT `BookAuthor_book_id_fkey` FOREIGN KEY (`book_id`) REFERENCES `Book`(`book_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BookAuthor` ADD CONSTRAINT `BookAuthor_author_id_fkey` FOREIGN KEY (`author_id`) REFERENCES `Author`(`author_id`) ON DELETE CASCADE ON UPDATE CASCADE;
