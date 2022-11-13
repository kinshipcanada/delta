import Link from "next/link";

export default function PageHeader({ text, description, primaryLinkText, primaryLinkHref, secondaryLinkText, secondaryLinkHref, customPrimaryButton, customSecondaryButton }) {
    return (
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold text-gray-900"> { text }</h1>
          <p className="mt-2 text-sm text-gray-700">
            { description }
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
            {(customSecondaryButton) && (
                customSecondaryButton
            )}
            {(secondaryLinkText && secondaryLinkHref) && (
                <Link href={secondaryLinkHref}>
                    <button
                        type="button"
                        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        { secondaryLinkText }
                    </button> 
                </Link>
            )}
            {(customPrimaryButton) && (
                customPrimaryButton
            )}
            {(primaryLinkText && primaryLinkHref) && (
                <Link href={primaryLinkHref}>
                    <button
                        type="button"
                        className="ml-3 inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                        { primaryLinkText }
                    </button>
                </Link>
            )}
        </div>
      </div>
    )
  }
  