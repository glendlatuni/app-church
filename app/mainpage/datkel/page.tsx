"use client";
// app/mainpage/datkel/page.tsx
import Link from "next/link";
import { MajelisWithDetails } from "@/lib/interface";
import { useDataTable } from "@/hooks/useTable";
import { DataTable } from "@/components/ui/data-table";
import { 
  FilterDropdown, 
  TableToolbar 
} from "@/components/ui/table-filter";
import { 
  Home, 
  MapPin, 
  Users, 
//   Phone
} from "lucide-react";
// import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface DataMajelisWithProps {
  initialData: MajelisWithDetails[];
}

export default function DataKeluarga({ initialData }: DataMajelisWithProps) {

    console.log("initialData:", initialData);


  const {
    searchTerm,
    currentPage,
    sortConfig,
    selectedFilters,
    filteredData,
    paginatedData,
    uniqueFilterValues,
    totalPages,
    setSearchTerm,
    setCurrentPage,
    requestSort,
    toggleFilter,
  } = useDataTable<MajelisWithDetails>({
    data: initialData,
    itemsPerPage: 10
  });




  // Definisikan kolom tabel untuk Keluarga
  const columns = [
    {
      key: "index",
      header: "#",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cell: (_: any, index: number) => index + 1,
      sortable: false,
    },
    {
      key: "nama_keluarga",
      header: "Nama Keluarga",
      cell: (majelis: MajelisWithDetails) => (
        <Link href={`/profilekeluarga/${majelis.id}`} className="text-blue-600 hover:underline font-medium">
          {majelis.jemaat_id?.nama_jemaat}
        </Link>
      ),
      sortable: true,
      icon: <Home className="h-4 w-4" />,
    },

    {
      key: "ksp_id.ksp",
      header: "KSP",
      cell: (majelis: MajelisWithDetails) => majelis.jemaat_id?.keluarga_id?.ksp_id?.ksp || '-',
      sortable: true,
      icon: <Users className="h-4 w-4" />,
    },
    {
      key: "ksp_id.lingkungan_id.lingkungan",
      header: "Lingkungan",
      cell: (majelis: MajelisWithDetails) => majelis.jemaat_id?.keluarga_id?.ksp_id?.lingkungan_id?.lingkungan || '-',
      sortable: true,
      icon: <MapPin className="h-4 w-4" />,
    },

  ];

  // Component untuk menampilkan state kosong
  const EmptyState = (
    <div className="flex flex-col items-center justify-center h-64">
      <Home className="w-16 h-16 text-gray-300 mb-4" />
      <p className="text-gray-500 text-lg">Tidak ada data keluarga untuk ditampilkan.</p>
    </div>
  );

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Data Keluarga</h2>
        <Button asChild>
          <Link href="/datakeluarga/tambah">Tambah Keluarga</Link>
        </Button>
      </div>

      {/* Filter Toolbar */}
      <TableToolbar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Cari keluarga..."
        totalCount={initialData.length}
        filteredCount={filteredData.length}
        filters={[
          <FilterDropdown
            key="ksp"
            label="KSP"
            options={Array.from(uniqueFilterValues["ksp_id.ksp"] || []).map(value => ({ value }))}
            selectedValues={selectedFilters["ksp_id.ksp"] || []}
            onToggle={(value) => toggleFilter("ksp_id.ksp", value)}
            icon={<Users className="h-4 w-4" />}
          />,
          <FilterDropdown
            key="lingkungan"
            label="Lingkungan"
            options={Array.from(uniqueFilterValues["ksp_id.lingkungan_id.lingkungan"] || []).map(value => ({ value }))}
            selectedValues={selectedFilters["ksp_id.lingkungan_id.lingkungan"] || []}
            onToggle={(value) => toggleFilter("ksp_id.lingkungan_id.lingkungan", value)}
            icon={<MapPin className="h-4 w-4" />}
          />
        ]}
      />

      {/* Table Component */}
      <DataTable
        data={paginatedData}
        columns={columns}
        currentPage={currentPage}
        totalPages={totalPages}
        sortConfig={sortConfig}
        selectedFilters={selectedFilters}
        onSort={requestSort}
        onPageChange={setCurrentPage}
        onFilterRemove={toggleFilter}
        rowsPerPage={10}
        emptyState={EmptyState}
      />
    </div>
  );
}