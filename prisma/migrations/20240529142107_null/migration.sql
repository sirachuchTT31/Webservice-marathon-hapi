-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_event_id_fkey`;

-- DropForeignKey
ALTER TABLE `transaction` DROP FOREIGN KEY `transaction_event_join_id_fkey`;

-- AlterTable
ALTER TABLE `transaction` MODIFY `event_id` INTEGER NULL,
    MODIFY `event_join_id` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_event_id_fkey` FOREIGN KEY (`event_id`) REFERENCES `event`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction` ADD CONSTRAINT `transaction_event_join_id_fkey` FOREIGN KEY (`event_join_id`) REFERENCES `event_join`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
