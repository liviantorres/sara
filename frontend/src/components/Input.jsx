import React, { useState } from 'react';
import { Eye, EyeClosed, LockKeyhole } from 'lucide-react';

export default function Input({ id, placeholder, type, icon: Icon, className = "", ...props }) {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const currentType = isPasswordType && showPassword ? 'text' : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="relative w-full">
      {isPasswordType ? (
        <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
      ) : (
        Icon && (
          <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5 pointer-events-none" />
        )
      )}
      
      <input
        id={id}
        type={currentType}
        placeholder={placeholder}
        {...props}
        className={`w-full pl-12 pr-12 py-3 text-gray-800 placeholder-gray-400 rounded-lg border border-gray-300 bg-white focus:outline-none focus:shadow-[0_1px_4px_rgba(0,66,122,0.15)] text-base transition-all duration-200 ${className}`}
      />
      
      {isPasswordType && (
        <button
          type="button"
          onClick={togglePasswordVisibility}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer focus:outline-none"
        >
          {showPassword ? (
            <EyeClosed className="h-5 w-5" />
          ) : (
            <Eye className="h-5 w-5" />
          )}
        </button>
      )}
    </div>
  );
}