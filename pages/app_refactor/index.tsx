import { DocumentIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import Button from "../../components_/Button";
import { ButtonStyle, SmallIconSizing, StandardIconSizing } from "../../components_/types";
import { SectionHeader, Text } from "../../components_/Typography";
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
        <div>
            <SectionHeader>
                App Refactor
            </SectionHeader>
            <Text>
                This page is a playground for refactoring components.
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
                icon={<DocumentIcon />}
            />
        </div>
    )
}
