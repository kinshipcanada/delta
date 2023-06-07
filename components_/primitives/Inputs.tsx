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
            {label && <Label label={label} htmlFor={name} required={required} />}
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

export const Textarea: React.FC<TextInputProps> = ({ placeholder, type, name, id, value, onChange, required, inputCustomization, label }) => {
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
