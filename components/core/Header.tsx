import { DocumentIcon } from "@heroicons/react/24/outline";
import { PrimaryButton, SecondaryButton } from "./Buttons";

export type ButtonInterface = {
    link: string;
    text: string;
    action: () => void;
    download?: boolean;
    fileName?: string;
    iconRight?: any;
    iconLeft?: any;
}

