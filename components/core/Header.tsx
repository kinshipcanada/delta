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

export type HeaderInterface = {
    centered?: boolean;
    primaryButton?: ButtonInterface;
    secondaryButton?: ButtonInterface;
}

export default function Header({
    centered,
    primaryButton,
    secondaryButton,
}) {
    return (
        <div className="w-full max-w-xl lg:shrink-0 xl:max-w-2xl">
            <p className="text-base font-semibold leading-7 text-blue-600">Campaign</p>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            <span className="text-blue-600">Vision Kinship</span>  &middot; The Path To Self Sufficiency
            </h1>
            <p className="relative mt-6 text-lg leading-8 text-gray-600 sm:max-w-md lg:max-w-none">
            Cupidatat minim id magna ipsum sint dolor qui. Sunt sit in quis cupidatat mollit aute velit. Et
            labore commodo nulla aliqua proident mollit ullamco exercitation tempor. Sint aliqua anim nulla sunt
            mollit id pariatur in voluptate cillum. Eu voluptate tempor esse minim amet fugiat veniam occaecat
            aliqua.
            </p>
            <div className="mt-8">
                <PrimaryButton link = "/donate" text = "Make A Donation &rarr;" />
                <div className="inline-block ml-2" />
                <SecondaryButton download={true} link = "/papers/vision.pdf" fileName={"Vision Kinship: The Path To Self Sufficiency"} iconRight={DocumentIcon} text = "Download Full Vision Paper" />
            </div>
        </div>
    )
}