export const JustifyBetween: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex justify-between">
            { children }
        </div>
    )
}

export const JustifyCenter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="text-center items-center justify-center h-full w-full">
            { children }
        </div>
    )
}

export const JustifyEnd: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex justify-end">
            { children }
        </div>
    )
}