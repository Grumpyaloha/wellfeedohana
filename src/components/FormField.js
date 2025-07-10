import React from 'react';

const FormField = ({ field, value, onChange }) => {
    const { id, label, type, placeholder, options } = field;

    const handleCheckboxChange = (option, isChecked) => {
        const currentValues = Array.isArray(value) ? value : [];
        if (isChecked) {
            onChange(id, [...currentValues, option]);
        } else {
            onChange(id, currentValues.filter(v => v !== option));
        }
    };

    const renderField = () => {
        const commonInputClass = "w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition";
        switch (type) {
            case 'text':
            case 'number':
            case 'date':
            case 'tel':
            case 'email':
                return <input type={type} id={id} name={id} value={value || ''} onChange={(e) => onChange(id, e.target.value)} placeholder={placeholder} className={commonInputClass} />;
            case 'textarea':
                return <textarea id={id} name={id} value={value || ''} onChange={(e) => onChange(id, e.target.value)} placeholder={placeholder} rows="5" className={commonInputClass}></textarea>;
            case 'dimensions':
                return (
                    <div className="flex flex-col sm:flex-row gap-4">
                        <input type="number" name={`${id}_length`} value={value?.length || ''} onChange={(e) => onChange(id, {...value, length: e.target.value})} placeholder="Length (ft)" className={`${commonInputClass} sm:w-1/2`} />
                        <input type="number" name={`${id}_width`} value={value?.width || ''} onChange={(e) => onChange(id, {...value, width: e.target.value})} placeholder="Width (ft)" className={`${commonInputClass} sm:w-1/2`} />
                    </div>
                );
            case 'radio':
                return (
                    <div className="space-y-2">
                        {options.map(option => (
                            <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-green-50 transition cursor-pointer">
                                <input type="radio" name={id} value={option} checked={value === option} onChange={(e) => onChange(id, e.target.value)} className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300" />
                                <span className="ml-3 text-gray-800">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            case 'checkbox':
            case 'checklist':
                return (
                    <div className="space-y-2">
                        {options.map(option => (
                            <label key={option} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-green-50 transition cursor-pointer">
                                <input type="checkbox" name={option} checked={Array.isArray(value) && value.includes(option)} onChange={(e) => handleCheckboxChange(option, e.target.checked)} className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded" />
                                <span className="ml-3 text-gray-800">{option}</span>
                            </label>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="mb-8 p-6 bg-white rounded-xl shadow-md border border-gray-100">
            <label htmlFor={id} className="block text-xl font-semibold text-gray-800 mb-2">{label}</label>
            <p className="text-gray-600 mb-4 italic">{field.guidance}</p>
            {renderField()}
        </div>
    );
};

export default FormField;
