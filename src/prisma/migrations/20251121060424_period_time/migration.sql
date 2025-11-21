/*
  Warnings:

  - The `period` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "period",
ADD COLUMN     "period" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
