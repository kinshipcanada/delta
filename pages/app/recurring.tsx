
import React from "react";
import { AppLayout } from "../../components/prebuilts/Layouts";
import { Button, VerticalSpacer, AppPageProps, ButtonStyle, SpacerSize, SectionHeader, JustifyCenter } from  "../../components/primitives";

export default function Index() {
    return (
        <AppLayout AppPage={AppHomePage} />
    )
}

const AppHomePage: React.FC<AppPageProps> = () => {
    return (
        <JustifyCenter>
            <SectionHeader>Support for recurring donations is coming soon...</SectionHeader>
            <VerticalSpacer size={SpacerSize.Medium} />
            <Button text="Dashboard Home" style={ButtonStyle.Secondary} href={"/app"}></Button>
        </JustifyCenter> 
    )
}


