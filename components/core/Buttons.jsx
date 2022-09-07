import Link from "next/link";

export function PrimaryButton(props) {
    return (
        <Link href = { props.link }>
            <button
                type="button"
                className={
                    props.centerText ?

                    "transition delay-50 border border-blue-600 inline-flex items-center rounded border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"

                    :

                    "flex justify-center transition delay-50 border border-blue-600 inline-flex items-center rounded border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                }
            >
                { props.iconLeft ? <props.iconLeft className = "h-4 w-4 mr-2" /> : null }
                { props.text }
                { props.iconRight ? <props.iconRight className = "h-4 w-4 ml-2" /> : null }
            </button>
        </Link>
    )
}

export function SecondaryButton (props) {
    return (
        <Link href = { props.link }>
            <button
                type="button"
                className={
                    props.centerText ?

                    "border border-slate-300 inline-flex items-center rounded border border-transparent bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"

                    :

                    "flex justify-center transition delay-50 border border-slate-300 inline-flex items-center rounded border border-transparent bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                }
            >
                { props.iconLeft ? <props.iconLeft className = "h-4 w-4 mr-2" /> : null }
                { props.text }
                { props.iconRight ? <props.iconRight className = "h-4 w-4 ml-2" /> : null }
            </button>
        </Link>
    )
}
