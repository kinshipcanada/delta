import React from "react"
import { Label } from "./Typography"
import { TextInputProps } from "./types"
import Button from "./Button"

export const TextInput: React.FC<TextInputProps> = ({ placeholder, type, name, id, value, onChange, required, inputCustomization, label, button }) => {

    const panelStyling = (button != null && button != undefined) ? "flex  mt-2" : "mt-2"
    const inputStyling = (button != null && button != undefined) ? "flex-grow mr-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-auto sm:text-sm border-gray-300 rounded-md" : "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
    const customizationStyling = (inputCustomization != null && inputCustomization != undefined) ? (inputCustomization == "dollars" ? "" : "") : ""
    return (
        <div>
            {label && <Label label={label} required={required} />}
            <div className={panelStyling}>
                <input
                    placeholder={placeholder}
                    type={(type == null || type == undefined) ? "text" : type}
                    name={name}
                    id={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={inputStyling}
                />
                { button && <Button 
                    text={button.text}
                    style={button.style}
                    onClick={button.onClick}
                    href={button.href}
                    isLoading={button.isLoading}
                    icon={button.icon}
                    setter={button.setter}
                    size={button.size}
                /> }
            </div>
            
        </div>
    )
}

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
// export default function Example() {
//     return (
//       <div>
//         <label htmlFor="price" className="block text-sm font-medium leading-6 text-gray-900">
//           Price
//         </label>
//         <div className="relative mt-2 rounded-md shadow-sm">
//           <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
//             <span className="text-gray-500 sm:text-sm">$</span>
//           </div>
//           <input
//             type="text"
//             name="price"
//             id="price"
//             className="block w-full rounded-md border-0 py-1.5 pl-7 pr-12 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
//             placeholder="0.00"
//             aria-describedby="price-currency"
//           />
//           <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
//             <span className="text-gray-500 sm:text-sm" id="price-currency">
//               USD
//             </span>
//           </div>
//         </div>
//       </div>
//     )
//   }
  