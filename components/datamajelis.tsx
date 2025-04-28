// components/dataMajelis.tsx
'use client'; 

import { MajelisWithDetails } from "@/lib/interface"; 
import { useState } from "react";

import Link from 'next/link'; // Untuk link ke profil jemaat (opsional)


interface DataMajelisProps {
  initialData: MajelisWithDetails[]; // Data awal majelis
}


export default function DataMajelis({initialData}: DataMajelisProps) {

  
  const [majelisList] = useState<MajelisWithDetails[]>(initialData);

  if (!majelisList || majelisList.length === 0) {
    return <p className="text-center text-gray-500">Tidak ada data majelis untuk ditampilkan.</p>;
  }


  console.log("CLIENT: Data majelis:", majelisList);

  // Tampilan utama jika data berhasil diambil
  return (
    <div className="p-4 border rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Daftar Anggota Majelis</h2>
      <ul className="space-y-3">
        {majelisList.map((majelis) => {
          // Ekstraksi data dengan aman menggunakan optional chaining
          const jemaatNama = majelis.jemaat_id?.nama_jemaat;
          const jemaatId = majelis.jemaat_id?.id;
 
          const kspNama = majelis.jemaat_id?.keluarga_id?.ksp_id?.ksp;
          const lingkunganNama = majelis.jemaat_id?.keluarga_id?.ksp_id?.lingkungan_id?.lingkungan;

          return (
            <li key={majelis.id} className="p-3 bg-gray-50 border rounded hover:bg-gray-100 transition-colors duration-150">
              {/* Baris Utama: Nama, Titel, Status */}
              <div className="flex justify-between items-center mb-1">
                <span className="font-medium text-lg text-gray-900">
                  {/* Link ke profil jemaat jika ID ada */}
                  {jemaatId ? (
                    <Link href={`/profilejemaat/${jemaatId}`} className="text-indigo-700 hover:underline">
                      {jemaatNama || 'Nama Jemaat ?'}
                    </Link>
                  ) : (
                    jemaatNama || 'Data Jemaat ?' // Tampilkan nama saja jika tidak ada ID untuk link
                  )}
                  <span className="text-base font-normal text-gray-600 ml-2">
                    ({majelis.titel || 'Tanpa Titel'})
                  </span>
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${majelis.status === true ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {majelis.status === true ? 'Aktif' : 'Tidak Aktif'}
                </span>
              </div>

              {/* Detail Tambahan: Keluarga, KSP, Lingkungan */}
              <div className="text-sm text-gray-600 pl-2 space-y-1">
                
                <p><strong>KSP:</strong> {kspNama ?? <span className="italic text-gray-400">N/A</span>}</p>
                <p><strong>Lingkungan:</strong> {lingkunganNama ?? <span className="italic text-gray-400">N/A</span>}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}