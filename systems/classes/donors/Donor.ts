import { CountryList, donor_details } from "../utility_classes";

export class Donor {

    donor_id: string;
    donor_details_object: donor_details
    first_name: string
    last_name: string
    stripe_cus_id: string[];
    email: string
    phone_number?: number
    address: {
        line_address: string,
        postal_code: string,
        city: string,
        state: string,
        country: CountryList | string,
    }

    constructor ( donor_details: donor_details, donor_id: string ) {
        this.donor_id = donor_id ? donor_id : null
        this.donor_details_object = donor_details;
        this.first_name = donor_details.first_name;
        this.last_name = donor_details.last_name;
        this.email = donor_details.email;
        this.stripe_cus_id = [donor_details.stripe_cus_id];
        this.phone_number = donor_details.phone_number ? donor_details.phone_number : null;
        this.address = {
            line_address: donor_details.address.line_address,
            postal_code: donor_details.address.postal_code,
            city: donor_details.address.city,
            state: donor_details.address.state,
            country: donor_details.address.country
        }
    }

    fetch_donor_details() {
        return this.donor_details_object;
    }

    formatted_phone_number() {
        return `+1${this.phone_number.toString()}`
    }

    async find_all_stripe_cus_ids() {
        return 0
    }

    async find_all_donations_by_email() {
        return 0
    }
}