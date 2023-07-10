import React from "react"
import { Label } from "./Typography"
import { InputCustomizations, SelectProps, TextInputProps } from "./types"
import Button from "./Button"

export const TextInput: React.FC<TextInputProps> = ({ placeholder, type, name, id, value, onChange, required, inputCustomization, label, button }) => {

    const panelStyling = (button != null && button != undefined) ? "flex  mt-2" : "mt-2"
    const inputStyling = (button != null && button != undefined) ? "flex-grow mr-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-auto sm:text-sm border-gray-300 rounded-md " : "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md "
    const customization = (inputCustomization == null || inputCustomization == undefined) ? "" : 
        inputCustomization === InputCustomizations.Dollars ? "pl-7 pr-12" :
        inputCustomization === InputCustomizations.None ? "" : ""

        return (
        <div>
            {label && <Label label={label} htmlFor={name} required={required} />}
            
            <div className={panelStyling}>
                <div className="relative mt-2 rounded-md shadow-sm">
                    { inputCustomization === InputCustomizations.Dollars && 
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-gray-500 sm:text-sm">$</span>
                        </div>
                    }
                    <input
                        placeholder={placeholder}
                        type={(type == null || type == undefined) ? "text" : type}
                        name={name}
                        id={id}
                        value={value}
                        onChange={onChange}
                        required={required}
                        className={inputStyling + customization}
                    />
                    { inputCustomization === InputCustomizations.Dollars && 
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-gray-500 sm:text-sm" id="price-currency">
                                CAD
                            </span>
                        </div>
                    }
                </div>
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

export const SelectionInput: React.FC<SelectProps> = ({ options, name, id, value, onChange, required, label }) => {
  return (
    <div>
      {label && <Label label={label} htmlFor={name} required={required} />}
      <select
        id={id}
        name={name}
        onChange={onChange}
        className="mt-2 block w-full rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
        defaultValue={value}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export const TextArea: React.FC<TextInputProps> = ({ placeholder, type, name, id, value, onChange, required, inputCustomization, label }) => {
    const panelStyling = "mt-2"
    const inputStyling = "shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"

    return (
        <div>
            {label && <Label label={label} htmlFor={name} required={required} />}
            <div className={panelStyling}>
                <textarea
                    placeholder={placeholder}
                    rows={5}
                    name={name}
                    id={id}
                    value={value}
                    onChange={onChange}
                    required={required}
                    className={inputStyling}
                />
            </div>
            
        </div>
    )
}


export const CheckboxInput: React.FC<{ label: string, checked: boolean, required: boolean, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, checked, required, onChange }) => {
    return (
        <div className="flex items-center">
            <input 
                id={label}
                name={label}
                type="checkbox"
                className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded mr-2"
                checked={checked}
                onChange={onChange}
            />
            <Label htmlFor={label} label={label} required={required} />
        </div>
    )
}
