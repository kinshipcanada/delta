import { SpacerProps, SpacerSize } from "./types"

export const Spacer: React.FC<SpacerProps> = ({ size }) => {
    const spacerSize = size === SpacerSize.Small ? 'h-2' : size === SpacerSize.Medium ? 'h-4' : 'h-8'
    return <div className={`w-full ${spacerSize}`} />
}