import { InformationCircleIcon, DocumentDuplicateIcon, CheckCircleIcon } from "@heroicons/react/20/solid";
import { useState } from "react";

export default function CopyableInput ({ content }) {

    const [copied, setCopied] = useState(false)
  
    return (
      <div className = "mt-4">
        <label htmlFor={content} className="block text-sm font-medium text-gray-700">
          {content.label}
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <div className="relative flex items-stretch flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <InformationCircleIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name={content}
              id={content}
              className="focus:ring-blue-500 focus:border-blue-500 block w-full rounded-none rounded-l-md pl-10 sm:text-sm border-gray-300"
              value={content.value}
              readOnly
            />
          </div>
          <button
            type="button"
            onClick={() => {
              setCopied(true)
              navigator.clipboard.writeText(content.value);
  
              setTimeout(() => {
                setCopied(false)
              }, 3000)
            }}
            className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 text-sm font-medium rounded-r-md text-gray-700 bg-gray-50 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            {
              copied ?
  
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
  
              :
  
              <DocumentDuplicateIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            }
            <span>{copied ? <>Copied!</> : <>Copy</>}</span>
          </button>
        </div>
      </div>
    )
    
  }
