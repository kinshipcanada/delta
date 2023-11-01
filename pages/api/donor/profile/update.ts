import { ErroredResponse, FetchDonorResponse, MessageResponse } from "../../../../lib/classes/api";
import { updateDonor } from "../../../../lib/functions/donor";
import { verifyAllParametersExist } from "../../../../lib/utils/helpers";

/**
 * @description Updates a customers profile. Only intended to be used by the frontend account management page UI
 */
export default async function handler(req, res) {
    try {
        const { 
            donor_id, 
            existing_donor_object, 
            first_name, 
            last_name, 
            email,
            address_line_address,
            address_postal_code,
            address_city,
            address_state,
            address_country
        } = req.body

        verifyAllParametersExist("Not all parameters were provided.", donor_id, existing_donor_object, first_name, last_name, email, address_line_address, address_postal_code, address_city, address_state, address_country);

        const updatedDonor = await updateDonor(
            donor_id,
            existing_donor_object,
            first_name,
            last_name,
            email,
            address_line_address,
            address_postal_code,
            address_city,
            address_state,
            address_country
        )
        
        return updatedDonor ? res.status(200).send({
            status: 200,
            endpoint_called: `/api/donor/profile/update`,
            donor: updatedDonor
        } as FetchDonorResponse) : new Error("Something went wrong updating your donor profile");
    } catch (error) {
        res.status(500).send({
            status: 500,
            endpoint_called: `/api/donor/profile/update`,
            error: error.message
        } as ErroredResponse);
    }
};