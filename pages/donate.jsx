import { PrimaryButton } from "../components/core/Buttons";

export default function Donate() {
    return (
        <form className="p-4">
            <input className="border border-gray-800" />
            <PrimaryButton
                text = "Donate"
                link = "#"
            />
        </form>
    )
}