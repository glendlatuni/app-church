import { useState, useMemo } from "react";

// Generic type untuk data yang memiliki ID
export interface DataItem {
  id: string | number;
  [key: string]: any;
}

export interface UseDataTableProps<T extends DataItem> {
  data: T[];
  itemsPerPage?: number;
}

export interface UseDataTableReturn<T extends DataItem> {
  // State
  searchTerm: string;
  currentPage: number;
  sortConfig: {
    key: string;
    direction: "ascending" | "descending";
  } | null;
  selectedFilters: Record<string, string[]>;
  
  // Computed data
  filteredData: T[];
  paginatedData: T[];
  uniqueFilterValues: Record<string, Set<string>>;
  totalPages: number;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  requestSort: (key: string) => void;
  toggleFilter: (filterName: string, value: string) => void;
  resetFilters: () => void;
}

/**
 * Custom hook untuk mengelola tabel data dengan fitur pencarian, filtering, sorting, dan pagination
 */
export function useDataTable<T extends DataItem>({
  data,
  itemsPerPage = 10
}: UseDataTableProps<T>): UseDataTableReturn<T> {
  // State management
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ascending" | "descending";
  } | null>(null);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});

  // Ekstrak nilai unik untuk setiap atribut filter yang mungkin
  const uniqueFilterValues = useMemo(() => {
    const result: Record<string, Set<string>> = {};
    
    // Loop through all data items
    data.forEach(item => {
      // Loop through all properties of the data item
      Object.entries(item).forEach(([key, value]) => {
        // Skip non-filter fields
        if (key === 'id' || typeof value === 'object') return;

        // Initialize the set if it doesn't exist
        if (!result[key]) result[key] = new Set();
        
        // Add value to the set if it's a string
        if (typeof value === 'string' && value) {
          result[key].add(value);
        }
      });
      
      // Process nested objects for filters (handle up to 3 levels of nesting)
      Object.entries(item).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([nestedKey, nestedValue]) => {
            const filterKey = `${key}.${nestedKey}`;
            
            if (typeof nestedValue === 'string' && nestedValue) {
              if (!result[filterKey]) result[filterKey] = new Set();
              result[filterKey].add(nestedValue);
            } else if (typeof nestedValue === 'object' && nestedValue !== null) {
              Object.entries(nestedValue).forEach(([deepKey, deepValue]) => {
                const deepFilterKey = `${key}.${nestedKey}.${deepKey}`;
                
                if (typeof deepValue === 'string' && deepValue) {
                  if (!result[deepFilterKey]) result[deepFilterKey] = new Set();
                  result[deepFilterKey].add(deepValue);
                }
              });
            }
          });
        }
      });
    });
    
    return result;
  }, [data]);

  // Sorted data
  const sortedData = useMemo(() => {
    const sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Handle nested properties with a helper function
        const getNestedProperty = (obj: any, path: string) => {
          const keys = path.split('.');
          return keys.reduce((acc, key) => 
            acc && acc[key] !== undefined ? acc[key] : null, obj);
        };

        let aValue = sortConfig.key.includes('.') 
          ? getNestedProperty(a, sortConfig.key) 
          : a[sortConfig.key];
        
        let bValue = sortConfig.key.includes('.')
          ? getNestedProperty(b, sortConfig.key)
          : b[sortConfig.key];

        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();
        
        // Handle null or undefined values
        if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  // Filtered data based on search term and filters
  const filteredData = useMemo(() => {
    return sortedData.filter(item => {
      // Check if item matches search term
      const matchesSearch = searchTerm === "" || Object.entries(item).some(([key, value]) => {
        // Skip id field for search
        if (key === 'id') return false;
        
        // Check if the value is a string and contains the search term
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchTerm.toLowerCase());
        }
        
        // Check nested objects for the search term
        if (typeof value === 'object' && value !== null) {
          return Object.values(value).some(nestedValue => 
            typeof nestedValue === 'string' && 
            nestedValue.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        return false;
      });
      
      // Check if item matches all selected filters
      const matchesFilters = Object.entries(selectedFilters).every(([filterKey, selectedValues]) => {
        if (selectedValues.length === 0) return true;
        
        // Handle nested properties
        if (filterKey.includes('.')) {
          const keys = filterKey.split('.');
          let nestedValue = item;
          
          // Navigate to the nested value
          for (const key of keys) {
            nestedValue = nestedValue?.[key];
            if (nestedValue === undefined || nestedValue === null) return false;
          }
          
          return selectedValues.includes(nestedValue);
        }
        
        // Handle direct property
        return selectedValues.includes(item[filterKey]);
      });
      
      return matchesSearch && matchesFilters;
    });
  }, [sortedData, searchTerm, selectedFilters]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Reset to page 1 when filters or search change
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedFilters]);

  // Sort handler
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Toggle filter selection
  const toggleFilter = (filterName: string, value: string) => {
    setSelectedFilters(prev => {
      const newFilters = { ...prev };
      
      if (!newFilters[filterName]) {
        newFilters[filterName] = [];
      }
      
      if (newFilters[filterName].includes(value)) {
        newFilters[filterName] = newFilters[filterName].filter(v => v !== value);
      } else {
        newFilters[filterName] = [...newFilters[filterName], value];
      }
      
      // Remove empty arrays
      if (newFilters[filterName].length === 0) {
        delete newFilters[filterName];
      }
      
      return newFilters;
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedFilters({});
    setSearchTerm("");
    setCurrentPage(1);
  };

  return {
    // State
    searchTerm,
    currentPage,
    sortConfig,
    selectedFilters,
    
    // Computed data
    filteredData,
    paginatedData,
    uniqueFilterValues,
    totalPages,
    
    // Actions
    setSearchTerm,
    setCurrentPage,
    requestSort,
    toggleFilter,
    resetFilters
  };
}