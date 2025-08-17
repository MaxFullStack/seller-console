import { useState } from 'react';
import type { ColumnFiltersState } from '@tanstack/react-table';

export const useTableFilters = () => {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  return {
    columnFilters,
    setColumnFilters,
  };
};