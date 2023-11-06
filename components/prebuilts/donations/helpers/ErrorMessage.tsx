import { Alert, EventColors } from "../../../primitives"

const DonationErrorMessage = () => {
    return (
        <div className='p-4'>
            <Alert 
                type={EventColors.Error} 
                title={'Sorry, something went wrong'} 
                message={`Something went wrong in creating this donation. Please try again shortly. If the issue persists, please contact ${process.env.NEXT_PUBLIC_SUPPORT_EMAIL}`} 
            />
        </div> 
    )
}

export default DonationErrorMessage
