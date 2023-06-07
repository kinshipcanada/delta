
import React from "react";
import Button from "../../components_/Button";
import { AppLayout } from "../../components_/Layouts";
import { InlineLink } from "../../components_/Links";
import {  VerticalSpacer } from "../../components_/Spacer";
import { AppPageProps, ButtonSize, ButtonStyle, LargeIconSizing, SpacerSize, StandardIconSizing } from "../../components_/types";
import { PageHeader, Text, SectionHeader, Label } from "../../components_/Typography";
import { JustifyBetween, JustifyCenter, JustifyEnd } from "../../components_/Utils";
import { CheckboxInput, Textarea } from "../../components_/Inputs";
import { CheckIcon } from "@heroicons/react/24/outline";

export default function Index() {
    return (
        <AppLayout AppPage={AppHomePage} />
    )
}

const AppHomePage: React.FC<AppPageProps> = () => {

    const [feedback, setFeedback] = React.useState<string>("")
    const [stayAnonymous, setStayAnonymous] = React.useState<boolean>(false)

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
                <Button text="Submit Feedback" icon={<CheckIcon />} style={ButtonStyle.Primary} size={ButtonSize.Small} href={"/app"}></Button>
            </JustifyEnd>
        </div> 
    )
}
