
import React from "react";
import Button from "../../components_/Button";
import { AppLayout } from "../../components_/Layouts";
import { InlineLink } from "../../components_/Links";
import {  VerticalSpacer } from "../../components_/Spacer";
import { AppPageProps, ButtonStyle, LargeIconSizing, SpacerSize, StandardIconSizing } from "../../components_/types";
import { PageHeader, Text, SectionHeader } from "../../components_/Typography";
import { JustifyBetween, JustifyCenter } from "../../components_/Utils";
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


