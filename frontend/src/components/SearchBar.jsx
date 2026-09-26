import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';

export default function SearchBar({ value, onChange, placeholder = "Search by ID, customer, email, subject..." }) {
  const [internalValue, setInternalValue] = useState(value);

  // Sync internal value if prop changes externally
  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  // Debounce input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [internalValue, onChange, value]);

  const handleClear = () => {
    setInternalValue('');
    onChange('');
  };

  return (
    <div className="relative flex-1 min-w-[260px]">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
        <Search className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
      />
      {internalValue && (
        <button
          onClick={handleClear}
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
          title="Clear search"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
