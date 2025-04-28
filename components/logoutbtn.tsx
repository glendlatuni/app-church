'use client'
import { supabase } from '@/utils/supabase/client'
import { Button } from './ui/button'
import { useRouter } from 'next/navigation'

import React from 'react'




const Logoutbtn = () => {

    const router = useRouter()

    const handleLogout = async () => {

        try {
            await supabase.auth.signOut()
            router.push('/login')
        } catch (error) {
            console.log(error)
        }

    }


  return (
    <Button onClick={handleLogout}>Logout</Button>
  )
}

export default Logoutbtn