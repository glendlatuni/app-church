"use client";
// components/ui/data-table
import { ReactNode } from "react";
import { DataItem } from "@/hooks/useTable";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Column<T extends DataItem> {
  key: string;
  header: string | ReactNode;
  cell: (item: T, index: number) => ReactNode;
  sortable?: boolean;
  icon?: ReactNode;
}

interface DataTableProps<T extends DataItem> {
  data: T[];
  columns: Column<T>[];
  currentPage: number;
  totalPages: number;
  sortConfig: {
    key: string;
    direction: "ascending" | "descending";
  } | null;
  selectedFilters?: Record<string, string[]>;
  onSort: (key: string) => void;
  onPageChange: (page: number) => void;
  onFilterRemove?: (filterName: string, value: string) => void;
  rowsPerPage?: number;
  emptyState?: ReactNode;
  isLoading?: boolean;
}

export function DataTable<T extends DataItem>({
  data,
  columns,
  currentPage,
  totalPages,
  sortConfig,
  selectedFilters = {},
  onSort,
  onPageChange,
  onFilterRemove,
  rowsPerPage = 10,
  emptyState,
  isLoading = false,
}: DataTableProps<T>) {
  // Handle active filters display
  const hasActiveFilters = Object.values(selectedFilters).some(
    values => values.length > 0
  );

  return (
    <div className="space-y-4">
      {/* Active filters display */}
      {hasActiveFilters && onFilterRemove && (
        <div className="flex flex-wrap gap-2 my-2">
          {Object.entries(selectedFilters).map(([filterName, values]) =>
            values.map(value => (
              <Badge
                key={`${filterName}-${value}`}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => onFilterRemove(filterName, value)}
              >
                {filterName.split('.').pop()}: {value} ×
              </Badge>
            ))
          )}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => (
                  <TableHead
                    key={`header-${index}`}
                    className={cn(column.sortable && "cursor-pointer")}
                    onClick={() => column.sortable && onSort(column.key)}
                  >
                    <div className="flex items-center gap-1">
                      {column.icon}
                      <span>{column.header}</span>
                      {column.sortable && sortConfig?.key === column.key && (
                        <ChevronDown
                          className={`h-4 w-4 transition-transform ${
                            sortConfig.direction === "descending" ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading state - you can customize this further
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <div className="flex justify-center items-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data.length === 0 ? (
                // Empty state
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    {emptyState || (
                      <div className="text-muted-foreground">
                        Tidak ada data untuk ditampilkan.
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                // Data rows
                data.map((item, rowIndex) => (
                  <TableRow key={item.id}>
                    {columns.map((column, colIndex) => (
                      <TableCell key={`cell-${rowIndex}-${colIndex}`}>
                        {column.cell(item, (currentPage - 1) * rowsPerPage + rowIndex)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="justify-center">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Math.max(1, currentPage - 1));
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show first page, last page, current page, and pages around current
              let pageToShow: number | null = null;

              if (totalPages <= 5) {
                // If 5 or fewer pages, show all page numbers
                pageToShow = i + 1;
              } else {
                // For more pages, show a strategic subset
                if (currentPage <= 3) {
                  // Near start: show first 3, ellipsis, last
                  if (i < 3) {
                    pageToShow = i + 1;
                  } else if (i === 3) {
                    return (
                      <PaginationItem key="ellipsis-1">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  } else {
                    pageToShow = totalPages;
                  }
                } else if (currentPage >= totalPages - 2) {
                  // Near end: show first, ellipsis, last 3
                  if (i === 0) {
                    pageToShow = 1;
                  } else if (i === 1) {
                    return (
                      <PaginationItem key="ellipsis-2">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  } else {
                    pageToShow = totalPages - (4 - i);
                  }
                } else {
                  // Middle: show first, ellipsis, current-1, current, current+1, ellipsis, last
                  if (i === 0) {
                    pageToShow = 1;
                  } else if (i === 1) {
                    return (
                      <PaginationItem key="ellipsis-3">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  } else if (i === 2) {
                    pageToShow = currentPage;
                  } else if (i === 3) {
                    return (
                      <PaginationItem key="ellipsis-4">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  } else {
                    pageToShow = totalPages;
                  }
                }
              }

              if (pageToShow) {
                return (
                  <PaginationItem key={pageToShow}>
                    <PaginationLink
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onPageChange(pageToShow as number);
                      }}
                      isActive={currentPage === pageToShow}
                    >
                      {pageToShow}
                    </PaginationLink>
                  </PaginationItem>
                );
              }

              return null;
            })}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  onPageChange(Math.min(totalPages, currentPage + 1));
                }}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}