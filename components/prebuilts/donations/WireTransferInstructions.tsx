import { FC } from "react"
import { Donation } from "@prisma/client"

const WireTransferInstructions: FC<{ globalDonation: Donation }> = ({ globalDonation }) => {
    return (
        <div>
            WTI
        </div>
    )
}

export default WireTransferInstructions