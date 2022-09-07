import { withPageAuthRequired } from "@auth0/nextjs-auth0";
import AppLayout from "../../components/core/AppLayout";

export default function Receipts({ user }) {
    return (
        <AppLayout>
            <div>Hello, {user.email} - {user.name}</div>
        </AppLayout>
    )
}

export const getServerSideProps = withPageAuthRequired();
