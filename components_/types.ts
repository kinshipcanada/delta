export const enum ButtonStyle {
    Primary = "primary",
    Secondary = "secondary"
}

export interface ButtonProps {
    text: string;
    style: ButtonStyle;
    onClick?: () => void;
    href?: string;
    isLoading?: boolean;
    icon?: React.ReactNode;
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

export const SmallIconSizing = "h-3 w-3 mr-2"
export const StandardIconSizing = "h-4 w-4 mr-2"
export const LargeIconSizing = "h-5 w-5 mr-2"