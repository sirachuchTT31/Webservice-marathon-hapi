/*
  Warnings:

  - You are about to drop the column `user_id` on the `transaction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_user_id_fkey`;

-- AlterTable
ALTER TABLE `event` ADD COLUMN `user_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `transaction` DROP COLUMN `user_id`;

-- AddForeignKey
ALTER TABLE `event` ADD CONSTRAINT `event_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
