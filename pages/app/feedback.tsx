
import React from "react";
import Button from "../../components_/primitives/Button";
import { AppLayout } from "../../components_/prebuilts/Layouts";
import { VerticalSpacer } from "../../components_/primitives/Spacer";
import { AppPageProps, ButtonSize, ButtonStyle, SpacerSize } from "../../components_/primitives/types";
import { PageHeader, Text } from "../../components_/primitives/Typography";
import { JustifyEnd } from "../../components_/primitives/Utils";
import { CheckboxInput, Textarea } from "../../components_/primitives/Inputs";
import { CheckIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { ErroredResponse, MessageResponse } from "../../system/classes/api";
import { callKinshipAPI } from "../../system/utils/helpers";

export default function Index() {
    return (
        <AppLayout AppPage={AppHomePage} />
    )
}

const AppHomePage: React.FC<AppPageProps> = ({ donor }) => {

    const [loading, setLoading] = React.useState<boolean>(false)
    const [feedback, setFeedback] = React.useState<string>("")
    const [stayAnonymous, setStayAnonymous] = React.useState<boolean>(false)

    const handleSubmit = async () => {
        setLoading(true)

        if (feedback.length < 1) {
            toast.error("Please enter some feedback.", { position: "top-right" })
            setLoading(false)
            return
        }

        const response: MessageResponse | ErroredResponse = await callKinshipAPI('/api/feedback/create', {
            feedback: feedback,
            donor_id: stayAnonymous ? null : donor.donor_id
        })

        if (response.status == 500) { 
            toast.error("Error submitting feedback", { position: "top-right" })
        } else if (response.status == 200) {
            toast.success("Successfully submitted feedback. Thank you!", { position: "top-right" })
        } else {
            toast.error("An unknown error occurred", { position: "top-right" })
        }

        setLoading(false)
        return
    }


    return (
        <div>
            <PageHeader>Feedback</PageHeader>
            <VerticalSpacer size={SpacerSize.Small} />
            <Text>
                We&apos;re striving to give the easiest and most intuitive process for donating possible. 
                Any and all feedback is most welcome. Submit the feedback below, and select the stay anonymous 
                checkmark if you would prefer we didn&apos;t know this feedback came from you.
            </Text>
            <VerticalSpacer size={SpacerSize.Medium} />
            <Textarea 
                placeholder="Feedback" 
                type="text" 
                name="userFirstName" 
                id="userFirstName" 
                value={feedback}
                onChange={(e)=>{ setFeedback(e.target.value) }} 
                required={false} 
                inputCustomization="none"
            />
            <VerticalSpacer size={SpacerSize.Small} />
            <CheckboxInput label="Stay Anonymous" checked={stayAnonymous} required={false} onChange={(e)=>{ setStayAnonymous(e.target.checked) }} />
            <VerticalSpacer size={SpacerSize.Small} />
            <JustifyEnd>
                <Button 
                    text="Submit" 
                    isLoading={loading} 
                    icon={<CheckIcon />} 
                    style={ButtonStyle.Secondary}
                    size={ButtonSize.Small} 
                    onClick={handleSubmit}
                />
            </JustifyEnd>
        </div> 
    )
}
