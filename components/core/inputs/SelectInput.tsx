import { Label } from "../Typography";

export interface SelectInputProps {
  label: string;
  required?: boolean;
  setter: (value: string) => void;
  default?: string;
  options: {
    value: string;
    label: string;
  };
}

export function SelectInput({
  label,
  required,
  setter,
  options,
  defaultValue,
}) : React.ReactElement<SelectInputProps> {
    return (
      <div>
        <Label label={label} required={required} />
        <select
          id="location"
          name="location"
          onChange={(e) => {
            setter(e.target.value);
          }}
          defaultValue={defaultValue ? defaultValue : options[0].value}
          className="mt-2 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
        >
          {options.map((option) => (
            <option key={option.label} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }
  