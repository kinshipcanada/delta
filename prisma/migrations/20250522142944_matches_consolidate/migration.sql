/*
  Warnings:

  - You are about to drop the column `amountDonatedCents` on the `Cause` table. All the data in the column will be lost.
  - You are about to drop the column `donation_id` on the `Cause` table. All the data in the column will be lost.
  - You are about to drop the column `amountChargedInCents` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `amountDonatedInCents` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `feesChargedInCents` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `feesDonatedInCents` on the `Donation` table. All the data in the column will be lost.
  - You are about to drop the column `donorAddressCity` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `donorAddressCountry` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `donorAddressLineAddress` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `donorAddressPostalCode` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `donorAddressState` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `donorEmail` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `donorFirstName` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `donorLastName` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `donorMiddleName` on the `Donor` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerIds` on the `Donor` table. All the data in the column will be lost.
  - Added the required column `amountCents` to the `Cause` table without a default value. This is not possible if the table is not empty.
  - Added the required column `donationId` to the `Cause` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountChargedCents` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountDonatedCents` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feeChargedByProcessor` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `feesCoveredByDonor` to the `Donation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `donorName` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lineAddress` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Donor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Donor` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Cause" DROP CONSTRAINT "Cause_donation_id_fkey";

-- AlterTable
ALTER TABLE "Cause" DROP COLUMN "amountDonatedCents",
DROP COLUMN "donation_id",
ADD COLUMN     "amountCents" INTEGER NOT NULL,
ADD COLUMN     "donationId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Donation" DROP COLUMN "amountChargedInCents",
DROP COLUMN "amountDonatedInCents",
DROP COLUMN "feesChargedInCents",
DROP COLUMN "feesDonatedInCents",
ADD COLUMN     "amountChargedCents" INTEGER NOT NULL,
ADD COLUMN     "amountDonatedCents" INTEGER NOT NULL,
ADD COLUMN     "feeChargedByProcessor" INTEGER NOT NULL,
ADD COLUMN     "feesCoveredByDonor" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Donor" DROP COLUMN "donorAddressCity",
DROP COLUMN "donorAddressCountry",
DROP COLUMN "donorAddressLineAddress",
DROP COLUMN "donorAddressPostalCode",
DROP COLUMN "donorAddressState",
DROP COLUMN "donorEmail",
DROP COLUMN "donorFirstName",
DROP COLUMN "donorLastName",
DROP COLUMN "donorMiddleName",
DROP COLUMN "stripeCustomerIds",
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "country" "Country" NOT NULL DEFAULT 'CA',
ADD COLUMN     "donorName" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "lineAddress" TEXT NOT NULL,
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Cause" ADD CONSTRAINT "Cause_donationId_fkey" FOREIGN KEY ("donationId") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
