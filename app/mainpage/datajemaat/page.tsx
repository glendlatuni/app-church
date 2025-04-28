import DataJemaat from '@/components/datajemaat'
import { getJemaatData } from '@/action/action'; // Impor server action
import { Jemaat } from '@/lib/interface';
import React from 'react'

export default async function page () {

    // Panggil action langsung di Server Component
    const initialJemaatList: Jemaat[] = await getJemaatData();

    // Kirim data sebagai prop ke komponen DataJemaat
  return (
    <div>
      
      <DataJemaat initialData={initialJemaatList} />
    </div>
  )
}

