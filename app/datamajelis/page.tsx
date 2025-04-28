import DataMajelis from '@/components/datamajelis'
import { getMajelisData } from '@/action/action'
import { MajelisWithDetails } from '@/lib/interface'
import React from 'react'

export default async function page() {
  const initialMajelisList: MajelisWithDetails[] =  await getMajelisData();

  return (
    <div>
        <DataMajelis initialData={initialMajelisList}/>
    </div>
  )
}

