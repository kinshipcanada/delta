import { XCircleIcon } from '@heroicons/react/20/solid'
import { CheckCircleIcon } from '@heroicons/react/20/solid'
import { BlueLoading } from './Loaders'

export function ErrorAlert({ title, message }) {
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">{ title ? title : "Error"}</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{ message ? message : null }</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function SuccessAlert({ title, message }) {
  return (
    <div className="rounded-md bg-green-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <CheckCircleIcon className="h-5 w-5 text-green-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-green-800">{ title ? title : "Success"}</h3>
          <div className="mt-2 text-sm text-green-700">
            <p>{ message ? message : null }</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LoadingAlert({ title, message }) {
  return (
    <div className="rounded-md bg-blue-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <BlueLoading show={true} />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-blue-700">{ title }</p>
          <div className="mt-2 text-sm text-blue-700">
            <p>{ message ? message : null }</p>
          </div>
        </div>
      </div>
    </div>
  )
}

