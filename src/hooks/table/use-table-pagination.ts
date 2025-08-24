import { useState } from "react";
import type { PaginationState } from "@tanstack/react-table";

export interface UseTablePaginationProps {
  initialPageSize?: number;
}

export const useTablePagination = ({
  initialPageSize = 10,
}: UseTablePaginationProps = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  return {
    pagination,
    setPagination,
  };
};
