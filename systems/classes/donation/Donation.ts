import Stripe from "stripe";
import { DonorAddress, KinshipDonation, PaymentMethods, StripeTags } from "../utility_classes";
import { Cart } from "../cart/Cart";
import { Donor } from "../donors/Donor";
import { DatabaseDonation, CountryList, CurrencyList, KinshipPaymentMethod } from "../utility_classes";
import { v4 as uuidv4 } from 'uuid';
import { format_kinship_payment_method } from "../../functions/stripe";

export class Donation {

    donation_id: string;
    livemode: boolean;

    donor: Donor;

    created_at: Date;
    amount_in_cents: number;

    fees_covered: number;
    fees_charged_by_stripe: number;

    date_donated;
    date_logged: Date;

    transaction_successful: boolean;
    transaction_refunded: boolean;

    stripe_tags: StripeTags;
    recurring_donation: boolean;
    proof_available: boolean;

    payment_method: KinshipPaymentMethod

    cart: Cart;

    constructor ( 
        donor: Donor,
        livemode: boolean,
        created_at: Date,
        amount_in_cents: number,
        cart: Cart,
        fees_covered: number,
        fees_charged_by_stripe: number,
        payment_method: KinshipPaymentMethod,
        stripe_payment_intent_id?: string,
        stripe_charge_id?: string,
        stripe_balance_transaction_id?: string,
        stripe_customer_id?: string,
        proof_available?: boolean,
        donation_id?: string,
    ) {
        this.donation_id = donation_id ? donation_id : new uuidv4()
        this.livemode = livemode
        this.donor = donor;
        this.created_at = created_at;
        this.amount_in_cents = amount_in_cents;
        this.fees_covered = fees_covered;
        this.fees_charged_by_stripe = fees_charged_by_stripe;
        this.cart = cart
        this.payment_method = payment_method
        this.stripe_tags = {
            payment_intent_id: stripe_payment_intent_id,
            charge_id: stripe_charge_id,
            balance_transaction_id: stripe_balance_transaction_id,
            customer_id: stripe_customer_id
        }

        this.date_donated = Date.now()
        this.proof_available = proof_available ? proof_available : false
    }

    format_donation_for_upload() : DatabaseDonation {

        const formatted_cart = this.cart.format_cart_for_upload()

        const formatted_donation: DatabaseDonation = {
            donation_created: new Date().toDateString(),
            // Update this
            donor: null,
            email: this.donor.email,
            phone_number: this.donor.phone_number ? this.donor.phone_number : null,
            amount_in_cents: parseInt(this.amount_in_cents.toString()),
            fees_covered: this.fees_covered,
            fees_charged_by_stripe: this.fees_charged_by_stripe,
            // Hardcoding true for now, later we will log attempted txns too
            transaction_successful: true,
            // Need to add this
            transaction_refunded: false,
            payment_method: this.payment_method,
            donation_causes: formatted_cart,
            stripe_payment_intent_id: this.stripe_tags.payment_intent_id,
            stripe_charge_id: this.stripe_tags.charge_id,
            stripe_balance_transaction_id: this.stripe_tags.balance_transaction_id,
            stripe_customer_id: this.stripe_tags.customer_id,
            address_line_address: this.donor.address.line_address,
            address_country: this.donor.address.country.toLowerCase(),
            address_postal_code: this.donor.address.postal_code,
            address_city: this.donor.address.city,
            address_state: this.donor.address.state
        }

        return formatted_donation
    }

    format_donation_for_user() : KinshipDonation {

        const formatted_donation: KinshipDonation = {
            donation_identifiers: {
                kinship_donation_id: this.donation_id,
                stripe_charge_id: this.stripe_tags.charge_id,
                stripe_payment_intent_id: this.stripe_tags.payment_intent_id,
                stripe_balance_transaction_id: this.stripe_tags.balance_transaction_id,
                stripe_customer_id: this.stripe_tags.customer_id,
                stripe_payment_method_id: this.stripe_tags.payment_method_id
            },
            donation_created: this.created_at, 
            donor: this.donor, 
            amount_in_cents: this.amount_in_cents,
            fees_covered: this.fees_covered,
            fees_charged_by_stripe: this.fees_charged_by_stripe,
            transaction_successful: this.transaction_successful,
            transaction_refunded: this.transaction_refunded,
            payment_method: this.payment_method,
            donation_causes: this.cart.format_cart_for_upload(),
            livemode: this.livemode,
        }

        return formatted_donation
    }
}