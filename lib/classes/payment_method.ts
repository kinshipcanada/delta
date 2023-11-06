export type PaymentMethodType = "cash" | "card" | "acss_debit" | "wire_transfer"

export interface PaymentMethod {
    type: PaymentMethodType
    payment_method_id: string
}