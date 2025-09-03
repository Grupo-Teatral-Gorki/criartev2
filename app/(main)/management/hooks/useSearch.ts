import { useState, useMemo } from 'react';
import { BaseDocument, FieldExtractor } from '../types/mapping.types';

/**
 * Generic search hook for filtering documents
 * Implements Open/Closed Principle - open for extension, closed for modification
 */
export const useSearch = <T extends BaseDocument>(
  data: T[],
  fieldExtractor: FieldExtractor<T>
) => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    
    const search = searchTerm.toLowerCase();
    
    return data.filter((doc) => {
      const name = fieldExtractor.getName(doc)?.toLowerCase() || "";
      const email = fieldExtractor.getEmail(doc)?.toLowerCase() || "";
      
      return name.includes(search) || email.includes(search);
    });
  }, [data, searchTerm, fieldExtractor]);

  const clearSearch = () => setSearchTerm("");

  return {
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredData,
    hasResults: filteredData.length > 0,
    isSearching: searchTerm.trim().length > 0
  };
};
