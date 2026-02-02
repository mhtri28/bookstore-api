/*
  Warnings:

  - Made the column `used_count` on table `discount` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `discount` MODIFY `used_count` INTEGER NOT NULL;
