export function Header({ text, color }) {
    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        <span className="text-blue-600">Vision Kinship</span>  &middot; The Path To Self Sufficiency
    </h1>
}

export function SectionHeader({ text }) {
    return (
        <h2 className="text-lg font-medium text-gray-900 leading-6">
            { text }
        </h2>
    )
}

export function FormHeader({ text }) {
    return (
        <h2 className="text-md mb-1 font-semibold leading-7 text-gray-900">{ text }</h2>
    )
}

export function Label({ label, required }) {
    return (
        <label htmlFor={label} className="block text-sm font-medium text-gray-700">
            {label} { required && <span className="text-red-500">*</span> }
        </label>
    )
}