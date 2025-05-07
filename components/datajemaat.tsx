"use client";

import { useState, useMemo } from "react";
import { Jemaat } from "@/lib/interface";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  Search,
  UserRound,
  MapPin,
  // Calendar,
  Users,
  Tag
} from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Card, 
  CardContent, 
  //CardHeader, 
 // CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DataJemaatProps {
  initialData: Jemaat[];
}

export default function DataJemaat({ initialData }: DataJemaatProps) {
  const [jemaatList] = useState<Jemaat[]>(initialData);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Jemaat | string;
    direction: "ascending" | "descending";
  } | null>(null);
  
  // Filter options state
  const [selectedKategori, setSelectedKategori] = useState<string[]>([]);
  const [selectedKSP, setSelectedKSP] = useState<string[]>([]);
  const [selectedLingkungan, setSelectedLingkungan] = useState<string[]>([]);

  const itemsPerPage = 10;

  // Extract unique filter values
  const uniqueKategori = useMemo(() => {
    return [...new Set(jemaatList.map(jemaat => jemaat.kategori))].filter(Boolean);
  }, [jemaatList]);

  const uniqueKSP = useMemo(() => {
    return [...new Set(jemaatList.map(jemaat => jemaat.keluarga_id?.ksp_id?.ksp))].filter(Boolean);
  }, [jemaatList]);

  const uniqueLingkungan = useMemo(() => {
    return [...new Set(jemaatList.map(jemaat => jemaat.keluarga_id?.ksp_id?.lingkungan_id?.lingkungan))].filter(Boolean);
  }, [jemaatList]);

  // Sort function
  const sortedData = useMemo(() => {
    const sortableItems = [...jemaatList];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // Handle nested properties with a helper function

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getNestedProperty = (obj: any, path: string) => {
          const keys = path.split('.');
          return keys.reduce((acc, key) => acc && acc[key] !== undefined ? acc[key] : null, obj);
        };

        let aValue = sortConfig.key.includes('.') 
          ? getNestedProperty(a, sortConfig.key) 
          : a[sortConfig.key as keyof Jemaat];
        
        let bValue = sortConfig.key.includes('.')
          ? getNestedProperty(b, sortConfig.key)
          : b[sortConfig.key as keyof Jemaat];

        // Convert to lowercase for string comparison
        if (typeof aValue === 'string') aValue = aValue.toLowerCase();
        if (typeof bValue === 'string') bValue = bValue.toLowerCase();

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
  }, [jemaatList, sortConfig]);

  // Filter function
  const filteredData = useMemo(() => {
    return sortedData.filter(jemaat => {
      // Text search
      const matchesSearch = searchTerm === "" || 
        jemaat.nama_jemaat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jemaat.keluarga_id?.nama_keluarga?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jemaat.keluarga_id?.ksp_id?.ksp?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        jemaat.keluarga_id?.ksp_id?.lingkungan_id?.lingkungan?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Category filter
      const matchesKategori = selectedKategori.length === 0 || 
        (jemaat.kategori && selectedKategori.includes(jemaat.kategori));
      
      // KSP filter
      const matchesKSP = selectedKSP.length === 0 || 
        (jemaat.keluarga_id?.ksp_id?.ksp && selectedKSP.includes(jemaat.keluarga_id.ksp_id.ksp));
      
      // Lingkungan filter
      const matchesLingkungan = selectedLingkungan.length === 0 || 
        (jemaat.keluarga_id?.ksp_id?.lingkungan_id?.lingkungan && 
          selectedLingkungan.includes(jemaat.keluarga_id.ksp_id.lingkungan_id.lingkungan));
      
      return matchesSearch && matchesKategori && matchesKSP && matchesLingkungan;
    });
  }, [sortedData, searchTerm, selectedKategori, selectedKSP, selectedLingkungan]);

  // Pagination
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredData, currentPage]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Sorting handler
  const requestSort = (key: keyof Jemaat | string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Toggle filter selection
  const toggleKategori = (value: string) => {
    setSelectedKategori(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const toggleKSP = (value: string) => {
    setSelectedKSP(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  const toggleLingkungan = (value: string) => {
    setSelectedLingkungan(prev => 
      prev.includes(value) 
        ? prev.filter(item => item !== value)
        : [...prev, value]
    );
  };

  if (!jemaatList || jemaatList.length === 0) {
    return (
      <Card className="mt-4">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-64">
            <Users className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">Tidak ada data jemaat untuk ditampilkan.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Jemaat</h2>
          <p className="text-muted-foreground">
            Menampilkan total {filteredData.length} jemaat dari {jemaatList.length} jemaat
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari jemaat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[250px]"
            />
          </div>
          
          {/* Kategori filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <span>Kategori</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {uniqueKategori.map((kategori) => (
                <DropdownMenuCheckboxItem
                  key={kategori}
                  checked={selectedKategori.includes(kategori as string)}
                  onCheckedChange={() => toggleKategori(kategori as string)}
                >
                  {kategori}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* KSP filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>KSP</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {uniqueKSP.map((ksp) => (
                <DropdownMenuCheckboxItem
                  key={ksp}
                  checked={selectedKSP.includes(ksp as string)}
                  onCheckedChange={() => toggleKSP(ksp as string)}
                >
                  {ksp}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Lingkungan filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Lingkungan</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {uniqueLingkungan.map((lingkungan) => (
                <DropdownMenuCheckboxItem
                  key={lingkungan}
                  checked={selectedLingkungan.includes(lingkungan as string)}
                  onCheckedChange={() => toggleLingkungan(lingkungan as string)}
                >
                  {lingkungan}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Active filters display */}
      {(selectedKategori.length > 0 || selectedKSP.length > 0 || selectedLingkungan.length > 0) && (
        <div className="flex flex-wrap gap-2 my-2">
          {selectedKategori.map(kategori => (
            <Badge key={`kat-${kategori}`} variant="secondary" className="cursor-pointer" onClick={() => toggleKategori(kategori)}>
              Kategori: {kategori} ×
            </Badge>
          ))}
          {selectedKSP.map(ksp => (
            <Badge key={`ksp-${ksp}`} variant="secondary" className="cursor-pointer" onClick={() => toggleKSP(ksp)}>
              KSP: {ksp} ×
            </Badge>
          ))}
          {selectedLingkungan.map(lingkungan => (
            <Badge key={`ling-${lingkungan}`} variant="secondary" className="cursor-pointer" onClick={() => toggleLingkungan(lingkungan)}>
              Lingkungan: {lingkungan} ×
            </Badge>
          ))}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                {/* 
                  Column definitions - you can add or remove columns based on your data structure
                  Each column has a sortable header that calls requestSort with the appropriate key
                */}
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('nama_jemaat')}>
                  <div className="flex items-center gap-1">
                    <UserRound className="h-4 w-4" />
                    <span>Nama Jemaat</span>
                    {sortConfig?.key === 'nama_jemaat' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('kategori')}>
                  <div className="flex items-center gap-1">
                    <Tag className="h-4 w-4" />
                    <span>Kategori</span>
                    {sortConfig?.key === 'kategori' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('keluarga_id.ksp_id.ksp')}>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>KSP</span>
                    {sortConfig?.key === 'keluarga_id.ksp_id.ksp' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => requestSort('keluarga_id.ksp_id.lingkungan_id.lingkungan')}>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>Lingkungan</span>
                    {sortConfig?.key === 'keluarga_id.ksp_id.lingkungan_id.lingkungan' && (
                      <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                    )}
                  </div>
                </TableHead>
                {/* 
                  Additional column options:
                  
                  <TableHead className="cursor-pointer" onClick={() => requestSort('tempat_lahir')}>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>Tempat Lahir</span>
                      {sortConfig?.key === 'tempat_lahir' && (
                        <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  
                  <TableHead className="cursor-pointer" onClick={() => requestSort('tanggal_lahir')}>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>Tanggal Lahir</span>
                      {sortConfig?.key === 'tanggal_lahir' && (
                        <ChevronDown className={`h-4 w-4 transition-transform ${sortConfig.direction === 'descending' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((jemaat, index) => (
                <TableRow key={jemaat.id}>
                  <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                  <TableCell>
                    <Link href={`/profilejemaat/${jemaat.id}`} className="text-blue-600 hover:underline font-medium">
                      {jemaat.nama_jemaat}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{jemaat.kategori || '-'}</Badge>
                  </TableCell>
                  <TableCell>{jemaat.keluarga_id?.ksp_id?.ksp || '-'}</TableCell>
                  <TableCell>{jemaat.keluarga_id?.ksp_id?.lingkungan_id?.lingkungan || '-'}</TableCell>
                  {/* 
                    Additional cell options:
                    
                    <TableCell>{jemaat.tempat_lahir || '-'}</TableCell>
                    <TableCell>{jemaat.tanggal_lahir || '-'}</TableCell>
                  */}
                </TableRow>
              ))}
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
                onClick={(e: { preventDefault: () => void; }) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.max(1, prev - 1));
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
                      onClick={(e: { preventDefault: () => void; }) => {
                        e.preventDefault();
                        setCurrentPage(pageToShow as number);
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
                onClick={(e: { preventDefault: () => void; }) => {
                  e.preventDefault();
                  setCurrentPage(prev => Math.min(totalPages, prev + 1));
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