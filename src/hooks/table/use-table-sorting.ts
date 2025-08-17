import { useState } from 'react';
import type { SortingState } from '@tanstack/react-table';

export interface UseTableSortingProps {
  initialSorting?: SortingState;
}

export const useTableSorting = ({ initialSorting = [] }: UseTableSortingProps = {}) => {
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  return {
    sorting,
    setSorting,
  };
};