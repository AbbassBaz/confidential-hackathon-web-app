import React from 'react';

const FilterIcon = ({ className = "h-5 w-5" }) => (
  <svg 
    className={className} 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor"
  >
    <path fillRule="evenodd" d="M3.792 2.938A49.069 49.069 0 0112 2.25c2.797 0 5.54.236 8.208.688a1.857 1.857 0 011.542 1.836v1.5a3 3 0 01-.879 2.121l-6.182 6.182a1.5 1.5 0 00-.439 1.061v2.927a3 3 0 01-1.658 2.684l-1.757.878A.75.75 0 019.75 21v-5.818a1.5 1.5 0 00-.44-1.06L3.13 8.937a3 3 0 01-.879-2.121v-1.5a1.857 1.857 0 011.542-1.836z" clipRule="evenodd" />
  </svg>
);

export default FilterIcon; 