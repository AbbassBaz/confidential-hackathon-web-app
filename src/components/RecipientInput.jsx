import React, { useState } from 'react';
import languages from '../constants/languages';
import { MailIcon, InfoIcon, XIcon } from './icons';

const {
  domain_start,
  invalid_domain,
  invalid_email,
  domain_exists,
  email_exists,
  press_enter
} = languages.recipient_validation;

const RecipientInput = ({ type = 'email', values = [], onChange, placeholder }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  
  // Validate email format
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };
  
  // Validate domain format
  const isValidDomain = (domain) => {
    return domain.startsWith('@') && domain.includes('.') && domain.length > 3;
  };
  
  const handleKeyDown = (e) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    
    const value = input.trim();
    if (!value) return;
    
    // Check if we're dealing with emails or domains
    const isDomain = type === 'domain';
    
    // Validation based on type
    if (isDomain) {
      if (!value.startsWith('@')) {
        setError(domain_start);
        return;
      }
      
      if (!isValidDomain(value)) {
        setError(invalid_domain);
        return;
      }
    } else {
      // Email validation
      if (!isValidEmail(value)) {
        setError(invalid_email);
        return;
      }
    }
    
    // Check for duplicates
    if (values.includes(value.toLowerCase())) {
      setError(isDomain ? domain_exists : email_exists);
      return;
    }
    
    // Add to values array
    onChange([...values, value.toLowerCase()]);
    setInput('');
    setError('');
  };
  
  const handleRemove = (index) => {
    const updatedValues = [...values];
    updatedValues.splice(index, 1);
    onChange(updatedValues);
  };
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="shadow-sm block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-150 ease-in-out"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <MailIcon className="h-5 w-5 text-gray-400" />
        </div>
      </div>
      
      {error && (
        <div className="rounded-lg bg-red-50 p-3 flex items-start">
          <svg className="h-5 w-5 text-red-400 mt-0.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <p className="ml-3 text-sm text-red-700">{error}</p>
        </div>
      )}
      
      {values.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {values.map((item, index) => (
            <span 
              key={index} 
              className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800 group hover:bg-indigo-200 transition-colors duration-150"
            >
              <span className="max-w-[200px] truncate">{item}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-indigo-200 text-indigo-600 hover:bg-indigo-300 hover:text-indigo-700 focus:outline-none transition-colors duration-150"
              >
                <XIcon className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipientInput;