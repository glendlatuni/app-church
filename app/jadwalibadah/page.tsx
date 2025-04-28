
import { getJadwal } from '@/action/action';
import JadwalIbadah from '@/components/listJadwal'
import { jadwalibadah } from '@/lib/interface';
import React from 'react'

export default async function page() {
    const initialJdawal : jadwalibadah[] = await getJadwal();
  return (
    <div>
        <JadwalIbadah initialData={initialJdawal}/>
    </div>
  )
}
