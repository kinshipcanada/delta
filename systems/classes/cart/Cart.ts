import { FormattedCart } from "../utility_classes"

export class Cart {
    causes: string[]
    total_amount_paid_in_cents: number

    constructor (causes: string[], total_amount_paid_in_cents: number, fees_covered: boolean) {
        this.causes = causes
        this.total_amount_paid_in_cents = total_amount_paid_in_cents
    }

    format_cart_for_upload(): FormattedCart {
        return {
            total_amount_paid_in_cents: this.total_amount_paid_in_cents,
            causes: this.causes
        }
    }
}
