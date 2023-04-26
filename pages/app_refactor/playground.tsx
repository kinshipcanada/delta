import { DocumentIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { Badge } from "../../components_/Badge";
import { Box } from "../../components_/Boxes";
import Button from "../../components_/Button";
import { PanelWithHeader, PanelWithHeaderAndFooter } from "../../components_/Panels";
import { VerticalSpacer } from "../../components_/Spacer";
import { ButtonStyle, EventColors, SmallIconSizing, SpacerSize, StandardIconSizing, Style } from "../../components_/types";
import { PageHeader, SectionHeader, Text } from "../../components_/Typography";
import { fetchDonor } from "../../system/functions/donor";
import { callKinshipAPI, supabase } from "../../system/utils/helpers";

export default function AppRefactor() {

    const [buttonIsLoading, setButtonIsLoading] = useState(false);
    const [user, setUser] = useState(null)

    const fetchUser = async () => {
        const loggedInUser = await supabase.auth.getUser() 

        if (loggedInUser) {
            const rep = await callKinshipAPI('/api/admin/test', {
                donor_id: loggedInUser.data.user.id,
            });
            console.log(rep)
            return
        } else {
            return
        }
    }

    useEffect(()=>{
        fetchUser()
    }, [])

    return (
        <Box>
            <PageHeader>
                App Refactor
            </PageHeader>
            <SectionHeader>
                App Refactor
            </SectionHeader>
            <VerticalSpacer size={SpacerSize.Medium} />
            <PanelWithHeaderAndFooter
                header={<>Bruh</>}
                footer={<>Footer</>}
            >
                <Text>
                    This is a panel with a header.
                </Text>
            </PanelWithHeaderAndFooter>
            <Text>
                This page is a playground for refactoring components.
                <Badge
                    text="Hello"
                    style={Style.Outlined}
                    color={EventColors.Warning}
                />
            </Text>
            <Button
                text="Click Me"
                style={ButtonStyle.Secondary}
                isLoading={buttonIsLoading}
                onClick={() => {
                    setButtonIsLoading(true);
                    setTimeout(() => {
                        setButtonIsLoading(false)
                        alert("Clicked!")
                    }, 1000);
                }}
                href="/"
                icon={<DocumentIcon />}
            />
        </Box>
    )
}
