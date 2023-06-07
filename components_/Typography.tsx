export const PageHeader = ({ children }) => {
    return (
        <h1 className="text-2xl font-bold leading-7 tracking-tight text-slate-800 sm:truncate sm:text-3xl">{ children }</h1>
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

export const Label = ({ label, required }) => {
    return (
        <label htmlFor={label} className="block text-sm font-medium text-gray-700">
            {label} { required && <span className="text-red-500">*</span> }
        </label>
    )
}
