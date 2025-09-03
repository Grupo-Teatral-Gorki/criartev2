import React from 'react';
import { BaseDocument, FieldExtractor } from '../types/mapping.types';
import { useSearch } from '../hooks/useSearch';
import { SearchInput } from './SearchInput';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { DataTable } from './DataTable';

interface GenericDataTabProps<T extends BaseDocument> {
  title: string;
  data: T[];
  loading: boolean;
  error: string | null;
  fieldExtractor: FieldExtractor<T>;
  loadingMessage?: string;
}

/**
 * Generic data tab component that eliminates code duplication
 * Implements Template Method Pattern and follows DRY principle
 */
export const GenericDataTab = <T extends BaseDocument>({
  title,
  data,
  loading,
  error,
  fieldExtractor,
  loadingMessage
}: GenericDataTabProps<T>) => {
  const {
    searchTerm,
    setSearchTerm,
    clearSearch,
    filteredData,
    isSearching
  } = useSearch(data, fieldExtractor);

  if (loading) {
    return <LoadingState message={loadingMessage} />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  const emptyMessage = isSearching 
    ? `Nenhum resultado encontrado para "${searchTerm}".`
    : `Nenhum ${title.toLowerCase()} encontrado.`;

  return (
    <section className="p-6 bg-white dark:bg-slate-900 rounded-lg shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
        <h4 className="text-lg font-bold">{title}</h4>
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onClear={clearSearch}
        />
      </div>
      
      <DataTable
        data={filteredData}
        fieldExtractor={fieldExtractor}
        emptyMessage={emptyMessage}
      />
    </section>
  );
};
