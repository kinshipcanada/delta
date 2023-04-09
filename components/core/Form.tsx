import { useState } from "react";
enum FieldType {
    Text = 'text',
    Email = 'email',
    Password = 'password',
    Number = 'number',
    Date = 'date',
    Time = 'time',
    Checkbox = 'checkbox',
    Radio = 'radio',
    Select = 'select',
    Textarea = 'textarea',
    File = 'file',
}

interface Field {
    label: string;
    placeholder: string;
    type: FieldType;
    name: string;
    value: string;
    required: boolean;
    options?: string[];
}

interface FormProps {
    fields: Field[];
    onSubmit: (values: Record<string, string>) => void;
}

const Form = ({ fields, onSubmit }: FormProps) => {
    const [values, setValues] = useState<Record<string, string>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit(values);
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setValues({ ...values, [name]: value });
    };

    return (
        <form onSubmit={handleSubmit}>
            {fields.map((field) => (
                <div key={field.name}>
                    <label htmlFor={field.name}>{field.label}</label>
                    {field.type === FieldType.Checkbox ? (
                        <input
                            id={field.name}
                            name={field.name}
                            value={values[field.name] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            required={field.required}
                            type={field.type}
                        />
                    ) : (
                        <input
                            id={field.name}
                            name={field.name}
                            value={values[field.name] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            required={field.required}
                            type={field.type}
                        />
                    )}
                    {errors[field.name] && <p>{errors[field.name]}</p>}
                </div>
            ))}
            <button type="submit">Submit</button>
        </form>
    );
};