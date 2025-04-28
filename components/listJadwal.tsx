'use client'

import {jadwalibadah} from "@/lib/interface"
import { useState } from "react"

interface dataJadwalProps{
    initialData : jadwalibadah[]
}

export default function JadwalIbadah({initialData}: dataJadwalProps){

    const [jadwalList] = useState<jadwalibadah[]>(initialData)

    if (!jadwalList || jadwalList.length === 0){
        return <p className="text-center text-gray-600">Tidak ada jadwal ibadah untuk ditampilkan.</p>
    }

    console.log(jadwalList)

    return(
        <>
            <h2 className="text-center text-2xl font-semibold mb-4">Jadwal Ibadah</h2>
            <ul className="space-y-4">
                {jadwalList?.map((jadwal) => (  
                    <li key={jadwal.id} className="bg-white p-4 rounded-lg shadow-md">
                  
                        <p className="text-gray-600">{jadwal.tanggal}</p>
                        <p className="text-gray-600">Palayan Firman : {jadwal.pelayan_firman.titel} {jadwal.pelayan_firman?.jemaat_id.nama_jemaat}</p>

                        <p className="text-gray-600">{jadwal.tempat_ibadah?.nama_jemaat}</p>
                        <p className="text-gray-600">Kategori : {jadwal.tempat_ibadah?.kategori}</p>
                       
                        <p className="text-gray-600">{jadwal.tempat_ibadah?.keluarga_id?.alamat.alamat_ibadah}</p>
                    </li>
                ))}
            </ul>
            </>
    )
}

