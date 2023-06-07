import { TextAlignment, TextColor, TextLineHeight, TextProps, TextSize, TextTracking, TextWeight } from "./types";

export const PageHeader = ({ children }) => {
    return (
        <h1 className="text-2xl font-bold leading-7 tracking-tight text-slate-800 sm:truncate sm:text-3xl">{ children }</h1>
    )
}

export const AnyText: React.FC<TextProps> = ({ 
    size = TextSize.Medium,
    color = TextColor.StandardSlate,
    weight = TextWeight.Normal,
    alignment = TextAlignment.Left,
    tracking = TextTracking.Normal,
    lineHeight = TextLineHeight.Normal,
    children
}) => {

    const textStyling = `${size} ${color} ${weight} ${alignment} ${tracking} ${lineHeight}`
    const Component = size === TextSize.Small ? "p" : size === TextSize.Medium ? "p" : size === TextSize.Large ? "h2" : size === TextSize.XLarge ? "h2" : size === TextSize.XXLarge ? "h1" : "p";

    return (
        <Component className={textStyling}>{ children }</Component>
    )
}

export const BaseHeader = ({ children }) => {
    return (
        <h2 className="text-lg font-medium leading-6 text-slate-900">{ children }</h2>
    )
}

export const SectionHeader = ({ children }) => {
    return (
        <h4 className="text-base tracking-tight font-semibold leading-7 text-slate-900">{ children }</h4>
    )
}

export const Text = ({ children }) => {
    return (
        <p className="text-sm leading-6 text-slate-600 flex items-center">{ children }</p>
    )
}

export const BoldText = ({ children }) => {
    return (
        <p className="text-sm leading-6 font-medium text-slate-600 flex items-center">{ children }</p>
    )
}

export const Label = ({ label, required, htmlFor }) => {
    return (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700">
            {label} { required && <span className="text-red-500">*</span> }
        </label>
    )
}