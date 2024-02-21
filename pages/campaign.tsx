import { Donor } from "@prisma/client"
import { useEffect, useState } from "react"

export default function Campaign() {
    const [donor, setDonor] = useState<Donor>()
    const loadAuthContext = async () => {}
    
    useEffect(()=>{

    }, [])

    return (
        <div>Campaign Page</div>
    )
}