
import React from "react";
import { Button, VerticalSpacer, AppPageProps, ButtonStyle, SpacerSize, SectionHeader, JustifyCenter } from  "../../components/primitives";

const AppRecurringPage: React.FC<AppPageProps> = () => {
    return (
        <JustifyCenter>
            <SectionHeader>Support for recurring donations is coming soon...</SectionHeader>
            <VerticalSpacer size={SpacerSize.Medium} />
            <Button text="Dashboard Home" style={ButtonStyle.Secondary} href={"/app"}></Button>
        </JustifyCenter> 
    )
}

export default AppRecurringPage
