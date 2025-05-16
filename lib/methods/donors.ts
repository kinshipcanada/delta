import prisma from "@lib/prisma";
import { Donation, Donor, PaymentMethodType, PrismaClient } from "@prisma/client";
import Stripe from "stripe";

export interface FetchDonorProfileProps {
    id?: string 
    email?: string
}

export interface AttachOrDetachPaymentMethodProps {
    id: string 
    paymentMethodId: string
    paymentMethodType: PaymentMethodType
}

export type UpdatableDonorProfile = Pick<Donor, "donorFirstName" | "donorLastName" | "donorMiddleName" | "donorAddressLineAddress" | "donorAddressState" | "donorAddressCity" | "donorAddressCountry" | "donorAddressPostalCode">
export type NoIdDonorProfile = Pick<Donor, "donorFirstName" | "donorLastName" | "donorMiddleName" | "donorAddressLineAddress" | "donorAddressState" | "donorAddressCity" | "donorAddressCountry" | "donorAddressPostalCode" | "stripeCustomerIds" | "donorEmail">

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
        if (donor.stripeCustomerIds.length > 0) {
            return donor.stripeCustomerIds[0]
        }

        const stripeCustomer = await this.stripeClient.customers.create({
            email: donor.donorEmail,
            name: `${donor.donorFirstName} ${donor.donorMiddleName ? `${donor.donorMiddleName} ` : ''}${donor.donorLastName}`,
            address: {
                line1: donor.donorAddressLineAddress,
                postal_code: donor.donorAddressPostalCode,
                city: donor.donorAddressCity,
                country: donor.donorAddressCountry,
                state: donor.donorAddressState,
            }
        })

        return stripeCustomer.id
    }
    
    public async createDonorProfile(donor: Donor) {
        if (donor.stripeCustomerIds.length == 0) {
            const stripeCustomerId = await this.createStripeProfile(donor)
            donor.stripeCustomerIds.push(stripeCustomerId)
        }

        const existingDonorProfile = await this.prismaClient.donor.findFirst({
            where: {
                donorEmail: donor.donorEmail
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

    async fetchDonorProfile(props: FetchDonorProfileProps): Promise<Donor> {
        if (!props.id && !props.email) {
            throw new Error("Donor id or email required to fetch profile")
        }

        let donorProfile: Donor;

        if (props.email) {
            donorProfile = await this.prismaClient.donor.findFirstOrThrow({
                where: {
                    donorEmail: props.email
                }
            })
        } else {
            donorProfile = await this.prismaClient.donor.findFirstOrThrow({
                where: {
                    id: props.id
                }
            })
        }

        if (props.id && props.email && (donorProfile.id != props.id || donorProfile.donorEmail != props.email)) {
            throw new Error("An unexpected internal error occured")
        }

        return donorProfile
    }

    public async checkIfDonorExists(donorEmail: string): Promise<Boolean> {
        try {
            const resp = await this.prismaClient.donor.findFirstOrThrow({
                where: {
                    donorEmail
                },
            })
    
            console.log(resp)

            return true
        } catch (error) {
            return false
        }
    }

    async fetchDonationsForDonor(donorEmail: string): Promise<Donation[]> {
        return await this.prismaClient.donation.findMany({
            where: {
                donor: {
                    donorEmail
                }
            },
            orderBy: {
                date: 'desc'
            }
        });
    } 
}