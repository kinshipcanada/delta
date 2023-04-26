export const PageHeader = ({ children }) => {
    return (
        <h1 className="text-2xl font-bold leading-7 tracking-tight text-gray-900 sm:truncate sm:text-3xl">{ children }</h1>
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