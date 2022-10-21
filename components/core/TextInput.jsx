export default function TextInput({ label, type, required, defaultValue, setter, placeholder }) {
    return (
      <div className="mt-1">
        <label htmlFor={label} className="block text-sm font-medium text-gray-700">
          { label }
        </label>
        <div className="mt-1">
          { required ?
          
            <input
              type={ type }
              id={ label }
              name={ label }
              autoComplete={ type }
              required
              placeholder={placeholder}
              onChange={(e)=>{setter(e.target.value)}}
              defaultValue={defaultValue}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
  
            :
  
            <input
              type={ type }
              id={ label }
              name={ label }
              onChange={(e)=>{setter(e.target.value)}}
              autoComplete={ type }
              placeholder={placeholder}
              defaultValue={defaultValue}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          }
        </div>
      </div>
    )
  }