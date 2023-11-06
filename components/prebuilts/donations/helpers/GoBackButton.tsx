import { ArrowLeftIcon } from "@heroicons/react/24/solid"
import { Button, ButtonSize, ButtonStyle } from "../../../primitives"
import { DonationStep } from "./types"

const GoBackHelper: React.FC<{ setStep: (value: DonationStep) => void }> = ({ setStep }) => {
    return (
        <div className='flex w-full justify-start'>
            <Button 
                text="Go Back" 
                icon={<ArrowLeftIcon />}
                style={ButtonStyle.OutlineUnselected}
                size={ButtonSize.Small} 
                onClick={() => setStep(DonationStep.AmountAndBilling )}
            />
        </div>
    )
}

export default GoBackHelper