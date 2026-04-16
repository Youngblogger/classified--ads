'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

export interface CategoryField {
  id?: number;
  name: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multi_select' | 'boolean';
  options?: string[];
  is_required?: boolean;
  sort_order?: number;
  group_name?: string | null;
}

interface DynamicFieldProps {
  field: CategoryField;
  value: any;
  onChange: (name: string, value: any) => void;
  error?: string;
}

export default function DynamicField({ field, value, onChange, error }: DynamicFieldProps) {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState('');
  
  const fieldName = field.name;
  const fieldValue = value[fieldName];
  const customFieldName = `${fieldName}_other`;
  const customFieldValue = value[customFieldName];

  const handleChange = (newValue: any) => {
    onChange(fieldName, newValue);
  };

  const handleOtherChange = (newValue: any) => {
    onChange(customFieldName, newValue);
  };

  const handleSelectOther = () => {
    setShowOtherInput(true);
    handleChange('Other');
  };

  const handleOtherInputChange = (inputValue: string) => {
    setOtherValue(inputValue);
    handleOtherChange(inputValue);
  };

  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={fieldValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={fieldValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        );

      case 'select':
        return (
          <div className="space-y-2">
            <select
              value={fieldValue === 'Other' && customFieldValue ? 'Other' : fieldValue}
              onChange={(e) => {
                if (e.target.value === 'Other') {
                  handleSelectOther();
                } else {
                  setShowOtherInput(false);
                  setOtherValue('');
                  handleOtherChange('');
                  handleChange(e.target.value);
                }
              }}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all bg-white"
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="Other">Other</option>
            </select>
            {showOtherInput && (
              <input
                type="text"
                value={otherValue}
                onChange={(e) => handleOtherInputChange(e.target.value)}
                placeholder={`Enter custom ${field.label.toLowerCase()}...`}
                className="w-full px-4 py-3 border border-dashed border-sky-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-200 transition-all bg-white"
              />
            )}
          </div>
        );

      case 'multi_select':
        const selectedValues = Array.isArray(fieldValue) ? fieldValue : [];
        const hasOtherSelected = selectedValues.includes('Other');
        
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {field.options?.map((option) => {
                const isSelected = selectedValues.includes(option);
                return (
                  <label
                    key={option}
                    className={`inline-flex items-center px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleChange([...selectedValues, option]);
                        } else {
                          handleChange(selectedValues.filter((v: string) => v !== option));
                        }
                      }}
                      className="sr-only"
                    />
                    <span className="text-sm font-medium">{option}</span>
                  </label>
                );
              })}
              {/* Other option for multi-select */}
              <label
                className={`inline-flex items-center px-4 py-2 rounded-xl border cursor-pointer transition-all ${
                  hasOtherSelected
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-primary-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={hasOtherSelected}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleChange([...selectedValues, 'Other']);
                      setShowOtherInput(true);
                    } else {
                      handleChange(selectedValues.filter((v: string) => v !== 'Other'));
                      setShowOtherInput(false);
                      setOtherValue('');
                      handleOtherChange('');
                    }
                  }}
                  className="sr-only"
                />
                <span className="text-sm font-medium">Other</span>
              </label>
            </div>
            {showOtherInput && (
              <input
                type="text"
                value={otherValue}
                onChange={(e) => handleOtherInputChange(e.target.value)}
                placeholder={`Enter custom ${field.label.toLowerCase()}...`}
                className="w-full px-4 py-3 border border-dashed border-sky-300 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-sky-200 transition-all bg-white"
              />
            )}
          </div>
        );

      case 'boolean':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={fieldValue === true || fieldValue === 'true' || fieldValue === '1'}
              onChange={(e) => handleChange(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-700">
              {fieldValue ? 'Yes' : 'No'}
            </span>
          </label>
        );

      default:
        return (
          <input
            type="text"
            value={fieldValue || ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.is_required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {error && (
        <div className="flex items-center gap-1 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
