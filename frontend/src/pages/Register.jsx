import React from 'react';

export default function SaraLogo({ className = "w-40" }) {
  return (
    <svg 
      viewBox="0 0 160 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
    >

      <rect x="0" y="24" width="8" height="16" rx="2" fill="#00427A" />
      <rect x="12" y="14" width="8" height="26" rx="2" fill="#005386" />
      <rect x="24" y="4" width="8" height="36" rx="2" fill="#F2A900" /> 
    
      <text 
        x="42" 
        y="32" 
        fontFamily="sans-serif" 
        fontWeight="900" 
        fontSize="34" 
        fill="#00427A" 
        letterSpacing="0.05em"
      >
        SARA
      </text>
      
      <text 
        x="45" 
        y="44" 
        fontFamily="sans-serif" 
        fontWeight="600" 
        fontSize="8" 
        fill="#6B7280" 
        letterSpacing="0.1em"
      >
        RETENÇÃO ACADÊMICA
      </text>
    </svg>
  );
}