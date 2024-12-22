//components/ui/input.tsx

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: {
    message?: string;
  };
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="font-medium">
          {label}
        </label>
        <input
          id={id}
          ref={ref}
          className={`border p-2 rounded ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          {...props}
        />
        {error && <p className="text-red-500 text-sm">{error.message}</p>}
      </div>
    );
  }
);

Input.displayName = "Input"; // Untuk debugging, menambahkan nama komponen

export default Input;
