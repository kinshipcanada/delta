export const enum DonationStep {
    AmountAndBilling,
    DonateWithCreditOrDebitCard,
    DonateWithAcssDebit,
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
