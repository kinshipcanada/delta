export const PageHeader = () => {
    return (
        <h1>ppp</h1>
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