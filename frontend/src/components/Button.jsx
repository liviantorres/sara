import React from 'react';

export default function Button({ children, className = "", type = "button", ...props }) {
  return (
    <button
      type={type}
      {...props}
      className={`
        w-full 
        bg-[#00427A] 
        hover:bg-[#002f57] 
        text-white 
        py-3 
        px-4 
        rounded-lg 
        font-semibold 
        text-base 
        shadow-sm 
        border 
        border-transparent 
        cursor-pointer
        focus:outline-none 
        focus:ring-2 
        focus:ring-offset-2 
        focus:ring-[#00427A] 
        transition-all 
        duration-200 
        flex 
        justify-center 
        items-center 
        ${className}
      `}
    >
      {children}
    </button>
  );
}