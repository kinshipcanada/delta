/*
  Warnings:

  - You are about to drop the column `donorId` on the `Donation` table. All the data in the column will be lost.
  - Made the column `region` on table `Cause` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_donorId_fkey";

-- DropIndex
DROP INDEX "Cause_donation_id_key";

-- AlterTable
ALTER TABLE "Cause" ALTER COLUMN "region" SET NOT NULL,
ALTER COLUMN "region" SET DEFAULT 'ANYWHERE';

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "donorId";
