import Link from "next/link";
import { classNames } from "../system/utils/helpers";

export function AppLink(props) {
    return (
      <Link
        key={props.name}
        href={props.link}
      >
        <a
          href={props.link}
          className={classNames(
            props.current ? 'border border-slate-200 bg-slate-50 text-slate-900' : 'text-gray-600 hover:bg-slate-50 hover:text-gray-900',
            'group flex items-center px-3 py-2 text-sm font-medium rounded-md'
          )}
        >
          <props.icon
            className={classNames(
              props.current ? 'text-slate-800' : 'text-gray-400 group-hover:text-slate-500',
              'flex-shrink-0 -ml-1 mr-3 h-6 w-6'
            )}
            aria-hidden="true"
          />
          <span className="truncate">{ props.name }</span>
        </a>
      </Link>
    )
  }