export default function SectionHeader({ header, subheader }) {
    return (
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">{ header }</h3>
        <p className="mt-2 max-w-4xl text-sm text-gray-500">
          { subheader }
        </p>
      </div>
    )
  }
  