// Donation lifecycle 

import prisma from "@lib/prisma";
import { Donation, PaymentMethodType } from "@prisma/client";
import { JsonObject } from "@prisma/client/runtime/library";

/**
 * endpoint that creates a donation by hand
 * endpoint that creates a donation from stripe webhook
 */
// Collect donation
async function createDonation(donation: Donation) {
    // Validate donation params
    if (donation.amountChargedInCents == 0 || donation.amountDonatedInCents == 0) {
        throw new Error("Donation must be at least 1 cent")
    }

    if (!(donation.donorFirstName && donation.donorLastName && donation.donorAddressLineAddress && donation.donorAddressPostalCode && donation.donorAddressCity && donation.donorAddressState && donation.donorAddressCountry && donation.donorEmail)) {
        throw new Error("Donor details missing from donation")
    }

    if (!donation.allocationBreakdown || typeof donation.allocationBreakdown != "object" || donation.allocationBreakdown == null) {
        throw new Error("Missing allocation breakdown")
    }

    if (donation.amountDonatedInCents != (donation.allocatedToCauses + donation.unallocatedToCauses)) {
        throw new Error("Allocation amounts do not add up")
    }

    if (donation.paymentMethodType == PaymentMethodType.CARD || donation.paymentMethodType == "ACSS_DEBIT") {
        if (!(donation.stripeChargeId && donation.stripeCustomerId && donation.stripePaymentIntentId && donation.stripePaymentMethodId)) {
            throw new Error("Missing Stripe identifiers on donation")
        }

        if (!(donation.feesChargedInCents == 0)) {
            throw new Error("Missing fees charged by Stripe")
        }
    }

    // Upload to db
    return await prisma.donation.create({
        data: {
            ...donation,
            allocationBreakdown: donation.allocationBreakdown as JsonObject
        }
    })
}

// Issue receipt 
function issueReceipt() {
    // Create a PDF of the receipt if eligible
}

// Distribute donation
function distribute() {
    // call bank api to send money somewhere
}

// Match causes
function matchProof() {}

// frontend lifecycle
function fetchSpecificDonation() {}
function fetchDonationsForDonor() {}

// donor tools
function createAccountForDonor() {}
function updateAccountForDonor() {}

function createAccountForPartner() {}
function updateAccountForPartner() {}

// admin tools
function emailDonor() {}
function fetchDonationsMatchingParams() {}


// helpers 
function _fetchStripeDonation() {}