import { SpacerProps, SpacerSize } from "./types"

export const VerticalSpacer: React.FC<SpacerProps> = ({ size }) => {
    const spacerSize = size === SpacerSize.Small ? 'h-2' : size === SpacerSize.Medium ? 'h-4' : 'h-8'
    return <div className={`w-full ${spacerSize}`} />
}

export const HorizontalSpacer: React.FC<SpacerProps> = ({ size }) => {
    const spacerSize = size === SpacerSize.Small ? 'w-2' : size === SpacerSize.Medium ? 'w-4' : 'w-8'
    return <div className={`h-full ${spacerSize}`} />
}