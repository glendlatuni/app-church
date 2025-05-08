"use client";
// component/ui/table-filter
import { ReactNode } from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";

interface FilterOption {
  value: string;
  label?: string;
  disabled?: boolean;
}

interface FilterDropdownProps {
  label: string;
  options: FilterOption[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  icon?: ReactNode;
}

export function FilterDropdown({
  label,
  options,
  selectedValues,
  onToggle,
  icon,
}: FilterDropdownProps) {
  if (options.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          {icon}
          <span>{label}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 max-h-72 overflow-y-auto">
        {options.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onCheckedChange={() => onToggle(option.value)}
            disabled={option.disabled}
          >
            {option.label || option.value}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Cari...",
  width = "w-[250px]",
}: SearchInputProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`pl-8 ${width}`}
      />
    </div>
  );
}

interface TableToolbarProps {
  searchTerm: string;
  onSearch: (value: string) => void;
  searchPlaceholder?: string;
  filters?: ReactNode[];
  actions?: ReactNode;
  totalCount?: number;
  filteredCount?: number;
}

export function TableToolbar({
  searchTerm,
  onSearch,
  searchPlaceholder = "Cari...",
  filters = [],
  actions,
  totalCount,
  filteredCount,
}: TableToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
      <div>
        {(totalCount !== undefined || filteredCount !== undefined) && (
          <p className="text-muted-foreground">
            {filteredCount !== undefined && `Menampilkan ${filteredCount} `}
            {totalCount !== undefined && filteredCount !== undefined && 
              filteredCount !== totalCount && `dari ${totalCount} `}
            data
          </p>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        <SearchInput
          value={searchTerm}
          onChange={onSearch}
          placeholder={searchPlaceholder}
        />
        
        {filters.map((filter, index) => (
          <div key={index}>{filter}</div>
        ))}
        
        {actions && <div className="ml-2">{actions}</div>}
      </div>
    </div>
  );
}