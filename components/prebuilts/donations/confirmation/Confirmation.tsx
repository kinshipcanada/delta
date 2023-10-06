import { FC } from "react"
import { Donation } from "../../../../system/classes/donation"
import { ConfirmationType } from "../helpers/types"

const Confirmation: FC<{ globalDonation: Donation, confirmationType: ConfirmationType }> = ({ globalDonation, confirmationType }) => {
    return (
        <div>
            {
                confirmationType == ConfirmationType.Unconfirmed ? "unconfirmed" :
                confirmationType == ConfirmationType.FurtherStepsRequired ? "further steps required" :
                confirmationType == ConfirmationType.ConfirmedProcessing ? "confirmed processing" :
                confirmationType == ConfirmationType.ConfirmedAndReceived ? "confirmed and received" : null
            }
        </div>
    )
}

export default Confirmation