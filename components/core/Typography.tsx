export function Header({ text, color }) {
    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
        <span className="text-blue-600">Vision Kinship</span>  &middot; The Path To Self Sufficiency
    </h1>
}

export function SectionHeader({ text }) {
    return (
        <h2 className="text-lg font-medium text-gray-900">
            { text }
        </h2>
    )
}