import { useContext } from 'react';
import { SearchContext, SearchableItem } from './SearchContext';

// Re-export the type for consumers
export type { SearchableItem as SearchItem };

/**
 * Hook to access search context
 * Separated to fix fast refresh warning
 */
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};
