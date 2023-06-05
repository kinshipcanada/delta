import { Donation } from "../system/classes/donation";
import { Donor } from "../system/classes/donor";

export const enum ButtonStyle {
    Primary,
    Secondary,
    OutlineSelected,
    OutlineUnselected,
    Disabled
}

export interface ButtonProps {
    text: string;
    style: ButtonStyle;
    onClick?: () => void;
    href?: string;
    isLoading?: boolean;
    icon?: React.ReactNode;
    setter?: (value: any) => void;
    size?: ButtonSize;
}

export const enum ButtonSize {
    Small,
    Standard,
    Large,
}

export const enum LoadingColors {
    White = "white",
    Blue = "blue",
    Slate = "slate",
}

export interface LoadingProps {
    color: LoadingColors;
}

export const enum EventColors {
    Neutral,
    Error,
    Warning,
    Success,
    Info,
}

export interface AlertProps {
    type: EventColors;
    title: string;
    message: string;
}

export const enum Style {
    Filled,
    Outlined,
}

export interface BadgeProps {
    color?: EventColors;
    style?: Style;
    text: string;
}

export const enum SpacerSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}

export interface SpacerProps {
    size: SpacerSize
}

export interface AppPageProps {
    donor: Donor,
    donations: Donation[]
}


export interface Tab {
    name: string;
    component: React.ReactElement;
}

export interface TabsProps {
    tabs: Tab[];
}

export interface TableProps {
    headers: string[]
    rows: { [key: string]: any }[];
}

export interface TextInputProps {
    placeholder: string,
    type: string,
    name: string,
    id: string,
    value: string,
    onChange: any,
    required: boolean,
    inputCustomization: "dollars" | "none",
    button?: ButtonProps
    label?: string,
}

export const SmallIconSizing = "h-3 w-3"
export const StandardIconSizing = "h-4 w-4"
export const LargeIconSizing = "h-5 w-5"
export const ExtraLargeIconSizing = "h-6 w-6"