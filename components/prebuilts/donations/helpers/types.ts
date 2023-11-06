export const enum DonationStep {
    AmountAndBilling,
    PaymentInfo,
    WireTransferInstructions,
    Confirmation,
    Error
}

export const enum ConfirmationType {
    Unconfirmed,
    ConfirmedAndReceived,
    ConfirmedProcessing,
    FurtherStepsRequired
}
