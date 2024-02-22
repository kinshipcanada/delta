import { useAuth } from "@components/prebuilts/Authentication"

export default function Dashboard() {
    const { donor, authContextLoading } = useAuth()

    if (authContextLoading) {
        return (
            <div>Loading your dashboard...</div>
        )
    }

    return (
        <div>
            Dashboard, {donor!.donorFirstName}
        </div>
    )
}