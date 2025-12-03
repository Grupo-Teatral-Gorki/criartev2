import { useState, ChangeEvent } from "react";
import { Eye, EyeOff } from "lucide-react";
import { applyMask, getMaskPlaceholder, removeNonNumeric, MaskType } from "@/app/utils/masks";

type MaskedInputProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> & {
    label?: string;
    maskType: MaskType;
    onChange?: (value: string, rawValue: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
    returnRawValue?: boolean; // If true, onChange returns only numbers
};

export function MaskedInput({
    label,
    maskType,
    className = "",
    id,
    value = "",
    onChange,
    onBlur,
    returnRawValue = false,
    placeholder,
    ...props
}: MaskedInputProps) {
    const [displayValue, setDisplayValue] = useState(
        typeof value === 'string' ? applyMask(value, maskType) : ''
    );

    // Generate a unique ID if not provided
    const inputId = id || `masked-input-${label?.replace(/\s+/g, '-').toLowerCase()}-${Math.random().toString(36).substr(2, 9)}`;

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const inputValue = e.target.value;
        const maskedValue = applyMask(inputValue, maskType);
        const rawValue = removeNonNumeric(inputValue);

        setDisplayValue(maskedValue);

        if (onChange) {
            // Return raw value (only numbers) or masked value based on preference
            onChange(returnRawValue ? rawValue : maskedValue, rawValue);
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        if (onBlur) {
            onBlur(e);
        }
    };

    // Update display value when external value changes
    if (typeof value === 'string' && value !== displayValue) {
        const newMaskedValue = applyMask(value, maskType);
        if (newMaskedValue !== displayValue) {
            setDisplayValue(newMaskedValue);
        }
    }

    const defaultPlaceholder = placeholder || getMaskPlaceholder(maskType);

    return (
        <div className="w-full">
            {label && (
                <label htmlFor={inputId} className="block mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                    {label}
                </label>
            )}
            <div className="relative w-full">
                <input
                    id={inputId}
                    type="text"
                    value={displayValue}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 border-2 border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 dark:focus:border-primary-400 focus:ring-4 focus:ring-primary-100 dark:focus:ring-primary-900/20 transition-all duration-200 outline-none shadow-soft hover:border-slate-300 dark:hover:border-slate-500 ${className}`}
                    placeholder={defaultPlaceholder}
                    {...props}
                />
            </div>
        </div>
    );
}
