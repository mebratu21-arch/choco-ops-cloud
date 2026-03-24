import React, { createContext, useState, ReactNode } from 'react';

export interface SearchableItem {
  id: string | number;
  searchText: string; // Combined searchable text
  data: unknown; // The actual item data - use unknown for type safety
}

interface SearchContextType {
  searchableItems: SearchableItem[];
  setSearchableItems: (items: SearchableItem[]) => void;
  filteredItems: SearchableItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

// Export context for use in useSearch hook
export { SearchContext };

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchableItems, setSearchableItems] = useState<SearchableItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = searchQuery.trim()
    ? searchableItems.filter(item =>
        item.searchText.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchableItems;

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SearchContext.Provider
      value={{
        searchableItems,
        setSearchableItems,
        filteredItems,
        searchQuery,
        setSearchQuery,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
