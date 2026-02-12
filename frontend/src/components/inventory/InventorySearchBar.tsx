import React, { useState, useEffect } from 'react';
import { Search, Loader2, X } from 'lucide-react';

interface InventorySearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  initialValue?: string;
}

const InventorySearchBar: React.FC<InventorySearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search inventory...", 
  initialValue = ""
}) => {
  const [value, setValue] = useState(initialValue);
  const [isSearching, setIsSearching] = useState(false);

  // Sync value when initialValue changes from parent
  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  useEffect(() => {
    // Only run search if value has changed or we are actively searching
    if (value === initialValue && !isSearching) return;

    const handler = setTimeout(() => {
      onSearch(value);
      setIsSearching(false);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [value, onSearch, initialValue, isSearching]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setIsSearching(true);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <div className="relative w-full">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-chocolate-400">
        {isSearching ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <Search className="w-5 h-5" />
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-10 py-3.5 bg-white border border-chocolate-100 rounded-xl shadow-sm 
                   focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary 
                   text-gray-900 placeholder-chocolate-300 transition-all text-base"
      />

      {value && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-chocolate-400 hover:text-chocolate-600 rounded-full hover:bg-chocolate-50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default InventorySearchBar;
