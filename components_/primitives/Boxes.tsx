export function Box({ children }) {
    return <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">{ children }</div>
}

export function CenterOfPageBox({ children }) {
    return <div className="flex items-center justify-center">{ children }</div>
}