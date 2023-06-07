export function JustifyBetween({ children }) {
    return (
        <div className="flex justify-between">
            { children }
        </div>
    )
}

export function JustifyCenter({ children }) {
    return (
        <div className="text-center items-center justify-center h-full w-full">
            { children }
        </div>
    )
}

export function JustifyEnd({ children }) {
    return (
        <div className="flex justify-end">
            { children }
        </div>
    )
}