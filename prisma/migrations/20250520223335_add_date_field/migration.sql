-- CreateEnum
CREATE TYPE "DonationStatus" AS ENUM ('PROCESSING', 'DELIVERED_TO_PARTNERS', 'PARTIALLY_DISTRIBUTED', 'FULLY_DISTRIBUTED');

-- CreateEnum
CREATE TYPE "DonationRegion" AS ENUM ('ANYWHERE', 'IRAQ', 'INDIA', 'TANZANIA', 'CANADA');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('CA', 'US', 'AF', 'AX', 'AL', 'DZ', 'AS', 'AD', 'AO', 'AI', 'AQ', 'AG', 'AR', 'AM', 'AW', 'AU', 'AT', 'AZ', 'BS', 'BH', 'BD', 'BB', 'BY', 'BE', 'BZ', 'BJ', 'BM', 'BT', 'BO', 'BQ', 'BA', 'BW', 'BV', 'BR', 'IO', 'BN', 'BG', 'BF', 'BI', 'CV', 'KH', 'CM', 'KY', 'CF', 'TD', 'CL', 'CN', 'CX', 'CC', 'CO', 'KM', 'CG', 'CD', 'CK', 'CR', 'CI', 'HR', 'CU', 'CW', 'CY', 'CZ', 'DK', 'DJ', 'DM', 'DO', 'EC', 'EG', 'SV', 'GQ', 'ER', 'EE', 'SZ', 'ET', 'FK', 'FO', 'FJ', 'FI', 'FR', 'GF', 'PF', 'TF', 'GA', 'GM', 'GE', 'DE', 'GH', 'GI', 'GR', 'GL', 'GD', 'GP', 'GU', 'GT', 'GG', 'GN', 'GW', 'GY', 'HT', 'HM', 'VA', 'HN', 'HK', 'HU', 'IS', 'IN', 'ID', 'IR', 'IQ', 'IE', 'IM', 'IL', 'IT', 'JM', 'JP', 'JE', 'JO', 'KZ', 'KE', 'KI', 'KP', 'KR', 'KW', 'KG', 'LA', 'LV', 'LB', 'LS', 'LR', 'LY', 'LI', 'LT', 'LU', 'MO', 'MG', 'MW', 'MY', 'MV', 'ML', 'MT', 'MH', 'MQ', 'MR', 'MU', 'YT', 'MX', 'FM', 'MD', 'MC', 'MN', 'ME', 'MS', 'MA', 'MZ', 'MM', 'NA', 'NR', 'NP', 'NL', 'NC', 'NZ', 'NI', 'NE', 'NG', 'NU', 'NF', 'MK', 'MP', 'NO', 'OM', 'PK', 'PW', 'PS', 'PA', 'PG', 'PY', 'PE', 'PH', 'PN', 'PL', 'PT', 'PR', 'QA', 'RE', 'RO', 'RU', 'RW', 'BL', 'SH', 'KN', 'LC', 'MF', 'PM', 'VC', 'WS', 'SM', 'ST', 'SA', 'SN', 'RS', 'SC', 'SL', 'SG', 'SX', 'SK', 'SI', 'SB', 'SO', 'ZA', 'GS', 'SS', 'ES', 'LK', 'SD', 'SR', 'SJ', 'SE', 'CH', 'SY', 'TW', 'TJ', 'TZ', 'TH', 'TL', 'TG', 'TK', 'TO', 'TT', 'TN', 'TR', 'TM', 'TC', 'TV', 'UG', 'UA', 'AE', 'GB', 'UM', 'UY', 'UZ', 'VU', 'VE', 'VN', 'VG', 'VI', 'WF', 'EH', 'YE', 'ZM', 'ZW');

-- CreateTable
CREATE TABLE "Donor" (
    "id" TEXT NOT NULL,
    "donorFirstName" TEXT NOT NULL,
    "donorMiddleName" TEXT,
    "donorLastName" TEXT NOT NULL,
    "donorEmail" TEXT NOT NULL,
    "donorAddressLineAddress" TEXT NOT NULL,
    "donorAddressCity" TEXT NOT NULL,
    "donorAddressState" TEXT NOT NULL,
    "donorAddressCountry" "Country" NOT NULL DEFAULT 'CA',
    "donorAddressPostalCode" TEXT NOT NULL,
    "stripeCustomerIds" TEXT[],

    CONSTRAINT "Donor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "status" "DonationStatus" NOT NULL DEFAULT 'PROCESSING',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "amountDonatedInCents" INTEGER NOT NULL,
    "amountChargedInCents" INTEGER NOT NULL,
    "feesChargedInCents" INTEGER NOT NULL,
    "feesDonatedInCents" INTEGER NOT NULL,
    "donorId" TEXT,
    "stripeCustomerId" TEXT,
    "stripeTransferId" TEXT,
    "stripeChargeId" TEXT,
    "version" DOUBLE PRECISION,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cause" (
    "id" TEXT NOT NULL,
    "donation_id" TEXT NOT NULL,
    "region" "DonationRegion",
    "amountDonatedCents" INTEGER NOT NULL,
    "inHonorOf" TEXT,
    "cause" TEXT NOT NULL,
    "subCause" TEXT,

    CONSTRAINT "Cause_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Cause_donation_id_key" ON "Cause"("donation_id");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "Donor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cause" ADD CONSTRAINT "Cause_donation_id_fkey" FOREIGN KEY ("donation_id") REFERENCES "Donation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
