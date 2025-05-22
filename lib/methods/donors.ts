import prisma from "@lib/prisma";
import { donation, donor, PrismaClient } from "@prisma/client";
import Stripe from "stripe";

export interface FetchDonorProfileProps {
    id?: string 
    email?: string
}

export interface AttachOrDetachPaymentMethodProps {
    id: string 
    paymentMethodId: string
}

export type UpdatableDonorProfile = Pick<donor, "donor_first_name" | "donor_last_name" | "donor_middle_name" | "donor_address_line_address" | "donor_address_state" | "donor_address_city" | "donor_address_country" | "donor_address_postal_code">
export type NoIdDonorProfile = Pick<donor, "donor_first_name" | "donor_last_name" | "donor_middle_name" | "donor_address_line_address" | "donor_address_state" | "donor_address_city" | "donor_address_country" | "donor_address_postal_code" | "stripe_customer_ids" | "donor_email">

export class DonorEngine {
    readonly stripeClient: Stripe;
    readonly prismaClient: PrismaClient

    constructor() {
        const stripePrivateKey = process.env.STRIPE_SECRET_KEY;
        if (!stripePrivateKey) {
            throw new Error("Stripe private key is not set in environment variables.");
        }
        this.stripeClient = new Stripe(stripePrivateKey, {
            apiVersion: "2023-08-16"
        })
        this.prismaClient = prisma
    }

    public async createStripeProfile(donor: NoIdDonorProfile) {
        if (donor.stripe_customer_ids.length > 0) {
            return donor.stripe_customer_ids[0]
        }

        const stripeCustomer = await this.stripeClient.customers.create({
            email: donor.donor_email,
            name: `${donor.donor_first_name} ${donor.donor_middle_name ? `${donor.donor_middle_name} ` : ''}${donor.donor_last_name}`,
            address: {
                line1: donor.donor_address_line_address,
                postal_code: donor.donor_address_postal_code,
                city: donor.donor_address_city,
                country: donor.donor_address_country,
                state: donor.donor_address_state,
            }
        })

        return stripeCustomer.id
    }
    
    public async createDonorProfile(donor: donor) {
        if (donor.stripe_customer_ids.length == 0) {
            const stripeCustomerId = await this.createStripeProfile(donor)
            donor.stripe_customer_ids.push(stripeCustomerId)
        }

        const existingDonorProfile = await this.prismaClient.donor.findFirst({
            where: {
                donor_email: donor.donor_email
            }
        })

        if (existingDonorProfile) {
            throw new Error("Donor profile already exists")
        }

        await this.prismaClient.donor.create({
            data: donor
        })
    }

    updateDonorProfile(donor: UpdatableDonorProfile) {}

    attachPaymentMethod(props: AttachOrDetachPaymentMethodProps) {
        throw new Error("Method not implemented")
    }

    detachPaymentMethod(props: AttachOrDetachPaymentMethodProps) {
        throw new Error("Method not implemented")
    }

    async fetchDonorProfile(props: FetchDonorProfileProps): Promise<donor> {
        if (!props.id && !props.email) {
            throw new Error("Donor id or email required to fetch profile")
        }

        let donorProfile: donor;

        if (props.email) {
            donorProfile = await this.prismaClient.donor.findFirstOrThrow({
                where: {
                    donor_email: props.email
                }
            })
        } else {
            donorProfile = await this.prismaClient.donor.findFirstOrThrow({
                where: {
                    id: props.id
                }
            })
        }

        if (props.id && props.email && (donorProfile.id != props.id || donorProfile.donor_email != props.email)) {
            throw new Error("An unexpected internal error occured")
        }

        return donorProfile
    }

    public async checkIfDonorExists(donorEmail: string): Promise<Boolean> {
        try {
            const resp = await this.prismaClient.donor.findFirstOrThrow({
                where: {
                    donor_email: donorEmail
                },
            })
    
            console.log(resp)

            return true
        } catch (error) {
            return false
        }
    }

    // async fetchDonationsForDonor(donorEmail: string): Promise<Donation[]> {
    //     return await this.prismaClient.donation.findMany({
    //         where: {
    //             donor: {
    //                 donorEmail
    //             }
    //         },
    //         orderBy: {
    //             date: 'desc'
    //         }
    //     });
    // } 
}