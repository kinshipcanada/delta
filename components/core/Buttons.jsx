import Link from "next/link";
import { BlueLoading } from "./Loaders";

function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

export function PrimaryButton(props) {
    if (props.action) {
        return (
            <button
                disabled = { props.disabled }
                onClick = { props.action }
                type={props.type ? props.type : "button"}
                className={
                    props.centerText ?

                    "transition delay-50 border border-blue-600 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

                    :

                    "flex justify-center transition delay-50 border border-blue-600 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }
            >
                { props.iconLeft ? <props.iconLeft className = "h-4 w-4 mr-2" /> : null }
                { props.text }
                { (props.iconRight && !props.loading) ? <props.iconRight className = "h-4 w-4 ml-2" /> : (props.iconRight && props.loading) ? <p>LOADING...</p> : null }
            </button>
        )
    } else {
        return (
            <Link href = { props.link }>
                <button
                    disabled = { props.disabled }
                    type={props.type ? props.type : "button"}
                    className={
                        props.centerText ?
    
                        "transition delay-50 border border-blue-600 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    
                        :
    
                        "flex justify-center transition delay-50 border border-blue-600 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }
                >
                    { props.iconLeft ? <props.iconLeft className = "h-4 w-4 mr-2" /> : null }
                    { props.text }
                    { (props.iconRight && !props.loading) ? <props.iconRight className = "h-4 w-4 ml-2" /> : (props.iconRight && props.loading) ? <p>LOADING...</p> : null }
                </button>
            </Link>
        )
    }
}

export function SecondaryButton (props) {
    if (props.action) {
        return (
            <button
                type={props.type ? props.type : "button"}
                disabled = { props.disabled }
                onClick = { props.action }
                className={
                    props.centerText ?

                    "border border-slate-300 inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"

                    :

                    "flex justify-center transition delay-50 border border-slate-300 inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                }
            >
                { props.iconLeft && !props.loading ? <props.iconLeft className = "h-4 w-4 mr-2" /> : null }
                { props.iconLeft && props.loading ? <BlueLoading show={true}/> : null }
                { props.text }
                { props.iconRight && !props.loading ? <props.iconRight className = "h-4 w-4 ml-2" /> : null }
                { props.iconRight && props.loading ? <BlueLoading show={true}/> : null }
            </button>
        )
    } else {
        return (
            <Link href = { props.link }>
                <button
                    type={props.type ? props.type : "button"}
                    disabled = { props.disabled }
                    className={
                        props.centerText ?
    
                        "border border-slate-300 inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    
                        :
    
                        "flex justify-center transition delay-50 border border-slate-300 inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    }
                >
                    { props.iconLeft ? <props.iconLeft className = "h-4 w-4 mr-2" /> : null }
                    { props.text }
                    { props.iconRight ? <props.iconRight className = "h-4 w-4 ml-2" /> : null }
                </button>
            </Link>
        )
    }
}
