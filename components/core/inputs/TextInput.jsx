import { Label } from "../Typography"

export default function TextInput({ label, type, required, defaultValue, setter, placeholder }) {
  return (
    <div className="mt-1">
      <Label label={label} required={required} />
      { 
        type == "dollars" ?

        <div className="relative mt-2 rounded-md shadow-sm">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <span className="text-gray-500 sm:text-sm">$</span>
          </div>
          <input
            type={"text"}
            id={label}
            name={label}
            autoComplete={type}
            required={required}
            placeholder={placeholder}
            onChange={(e) => { setter(e.target.value) }}
            defaultValue={defaultValue}
            className="py-1.5 pl-7 pr-12 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm sm:leading-6"
          />
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <span className="text-gray-500 sm:text-sm" id="price-currency">
              CAD
            </span>
          </div>
        </div>

        :

        <div className="mt-2">
          <input
            type={type}
            id={label}
            name={label}
            autoComplete={type}
            required={required}
            placeholder={placeholder}
            onChange={(e) => { setter(e.target.value) }}
            defaultValue={defaultValue}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      }
      
    </div>
  )
}

