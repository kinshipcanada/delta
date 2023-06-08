
import React from "react";
import Button from "../../components_/primitives/Button";
import { AppLayout } from "../../components_/prebuilts/Layouts";
import { VerticalSpacer } from "../../components_/primitives/Spacer";
import { AppPageProps, ButtonStyle, SpacerSize } from "../../components_/primitives/types";
import { SectionHeader } from "../../components_/primitives/Typography";
import { JustifyCenter } from "../../components_/primitives/Utils";
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


