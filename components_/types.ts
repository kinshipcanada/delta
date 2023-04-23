export const enum ButtonStyle {
    Primary = "primary",
    Secondary = "secondary"
}

export interface ButtonProps {
    text: string;
    style: ButtonStyle;
    onClick: () => void;
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

export const enum AlertType {
    Success = 'success',
    Error = 'error',
    Warning = 'warning',
    Info = 'info',
}

export interface AlertProps {
    type: AlertType;
    title: string;
    message: string;
}

export const SmallIconSizing = "h-3 w-3 mr-2"
export const StandardIconSizing = "h-4 w-4 mr-2"
export const LargeIconSizing = "h-5 w-5 mr-2"