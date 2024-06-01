-- AlterTable
ALTER TABLE `event` MODIFY `is_active` BOOLEAN NULL DEFAULT false;

-- AlterTable
ALTER TABLE `invoice` MODIFY `is_active` BOOLEAN NOT NULL DEFAULT false;
