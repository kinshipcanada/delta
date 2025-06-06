import { SelectOption } from "@lib/utils/constants";

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
    onClick?: (...args: any[]) => void;
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
    borderEnabled?: boolean;
    size?: BadgeSize;
}

export const enum BadgeSize {
    Small,
    Standard,
    Large,
}

export const enum SpacerSize {
    Small = 'small',
    Medium = 'medium',
    Large = 'large',
}

export interface SpacerProps {
    size: SpacerSize
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
    value?: string | number,
    onChange: any,
    required: boolean,
    inputCustomization?: InputCustomizations,
    button?: ButtonProps
    label?: string,
}

export const enum InputCustomizations {
    Dollars = "dollars",
    Copyable = "copyable",
    None = "none",
}

export interface SelectProps {
    options: SelectOption[],
    name: string,
    id: string,
    value: string | number,
    onChange: any,
    required: boolean,
    label?: string,
}

export const SmallIconSizing = "h-3 w-3"
export const StandardIconSizing = "h-4 w-4"
export const LargeIconSizing = "h-5 w-5"
export const ExtraLargeIconSizing = "h-6 w-6"

export const enum TextSize {
    Small = "text-sm",
    Medium = "text-md",
    Large = "text-lg",
    XLarge = "text-xl",
    XXLarge = "text-2xl",
    XXXLarge = "text-3xl",
    XXXXLarge = "text-4xl",
}

export const enum TextColor {
    StandardSlate = "text-slate-900",
    LightSlate = "text-slate-500",
    Blue = "text-blue-600",
    Red = "text-red-600",
}

export const enum TextWeight {
    Normal = "font-normal",
    Medium = "font-medium",
    Semibold = "font-semibold",
    Bold = "font-bold",
    Extrabold = "font-extrabold",
}

export const enum TextAlignment {
    Left = "text-left",
    Center = "text-center",
    Right = "text-right",
}

export const enum TextTracking {
    Tight = "tracking-tight",
    Normal = "tracking-normal",
    Wide = "tracking-wide",
}

export const enum TextLineHeight {
    None = "leading-none",
    Tight = "leading-tight",
    Snug = "leading-snug",
    Normal = "leading-normal",
    Relaxed = "leading-relaxed",
    Loose = "leading-loose",
}

export interface TextProps {
    size?: TextSize;
    color?: TextColor;
    weight?: TextWeight;
    alignment?: TextAlignment;
    tracking?: TextTracking;
    lineHeight?: TextLineHeight;
    children: React.ReactNode;
}

export interface InlineLinkProps {
    href: string;
    text: string;
}