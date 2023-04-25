export const PageHeader = ({ children }) => {
    return (
        <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">{ children }</h1>
    )
}

export const SectionHeader = ({ children }) => {
    return (
        <h4 className="text-base tracking-wide font-semibold leading-7 text-slate-900">{ children }</h4>
    )
}

export const Text = ({ children }) => {
    return (
        <p className="text-sm leading-6 text-slate-600">{ children }</p>
    )
}