import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, id, icon, ...props }, ref) => (
    <div className="relative group w-full">
      <input
        {...props}
        ref={ref}
        id={id}
        autoComplete="off"
        placeholder=" "
        className="peer w-full bg-white border border-gray-300 px-4 py-3 rounded-lg outline-none transition-all focus:border-black focus:ring-1 focus:ring-black text-gray-700 placeholder-transparent disabled:opacity-50"
      />
      <label
        htmlFor={id}
        className="absolute left-3 -top-2.5 bg-white px-1 text-sm text-gray-600 transition-all 
        peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3 peer-placeholder-shown:left-4
        peer-focus:-top-2.5 peer-focus:left-3 peer-focus:text-sm peer-focus:text-black font-medium pointer-events-none"
      >
        {label}
      </label>
      {icon && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </div>
      )}
    </div>
  ),
);
Input.displayName = "Input";
