export function JustifyBetween({ children }) {
    return (
        <div className="flex justify-between">
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