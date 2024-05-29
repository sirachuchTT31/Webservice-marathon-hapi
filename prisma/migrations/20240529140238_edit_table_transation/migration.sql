/*
  Warnings:

  - You are about to drop the column `trans_id` on the `event` table. All the data in the column will be lost.
  - You are about to drop the column `trans_id` on the `event_join` table. All the data in the column will be lost.
  - Added the required column `event_id` to the `transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `event_join_id` to the `transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `event` DROP FOREIGN KEY `event_trans_id_fkey`;

-- DropForeignKey
ALTER TABLE `event_join` DROP FOREIGN KEY `event_join_trans_id_fkey`;

-- AlterTable
ALTER TABLE `event` DROP COLUMN `trans_id`;

-- AlterTable
ALTER TABLE `event_join` DROP COLUMN `trans_id`;

-- AlterTable
ALTER TABLE `transaction` ADD COLUMN `event_id` INTEGER NOT NULL,
    ADD COLUMN `event_join_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_event_join_id_fkey` FOREIGN KEY (`event_join_id`) REFERENCES `event_join`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
