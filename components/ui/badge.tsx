export default function Badge({ color, children }: { color: string, children: React.ReactNode }) {
    return (
        <span className={`inline-flex items-center rounded-full bg-green-500 px-2.5 py-0.5 text-sm font-medium text-white`}>
            {children}
        </span>
    )
}