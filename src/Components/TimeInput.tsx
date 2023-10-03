import React, { useState, ChangeEvent, useEffect } from 'react';

interface TimeInputProps {
  value: number | undefined;
  onChange: (val: any) => void | (() => void);
}

function TimeInput({ value , onChange }: TimeInputProps) {

  const [inputValue, setInputValue] = useState<string | undefined>("00:00");
  
    useEffect(() => {
      setInputValue((prev) => value ? `${String(Math.floor(value / 100)).padStart(2, '0')}:${String(value % 100).padStart(2, '0')}` : "");
    },[value])
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setInputValue(prev => e.target.value);
  };

  const handleInputBlur = () => {
    let formattedInput = inputValue ? inputValue.replace(/\D/g, '') : undefined; // Remove non-digit characters

    // Ensure the formatted value is exactly 4 digits
    formattedInput = formattedInput ? formattedInput.padStart(4, '0') : undefined;
    
    // Extract hours and minutes
    let newHours:number | undefined = undefined
    let newMinutes:number | undefined = undefined
    if (formattedInput) {
      newHours = parseInt(formattedInput.slice(0, 2), 10);
      newMinutes = parseInt(formattedInput.slice(2, 4), 10);
    }
    
    //@ts-ignore
    const newTimeValue = formattedInput ? Math.min(23, Math.max(0, newHours)) * 100 + Math.min(59, Math.max(0, newMinutes)) : undefined;

    // Update the input value with the colon and notify the parent component
    setInputValue(prev => formattedInput ? `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}` : undefined);
    //@ts-ignore
    onChange(prev => newTimeValue);
  };

  return (
    <input
      className="p-2 rounded-lg text-black"
      value={inputValue}
      onChange={handleInputChange}
      onBlur={handleInputBlur} // Validate and update the value on blur
      type="text"
      inputMode="numeric"
    />
  );
}

export default TimeInput;
