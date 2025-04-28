/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

//app/dashboard/page

import { supabase } from "@/utils/supabase/client";
import React, { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import Logoutbtn from "@/components/logoutbtn";
import { useRouter } from "next/navigation";


interface Jemaat {
  id: number;
  nama_jemaat: string;
  tempat_lahir: string;
  tanggal_lahir: string;
  // Tambahkan kolom lain sesuai kebutuhan
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [jemaat, setJemaat] = useState<Jemaat | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const router = useRouter();



useEffect(() => {
  const fetchUserAndJemaat = async () => {
    setLoading(true); // Set loading true di awal
    setError(null); // Reset error state

    try {


      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!sessionData.session) {
        // Jika tidak ada sesi, arahkan ke halaman login
        router.push("/login");
        return;
      }


      // 1. Ambil data User
      const { data: userData, error: userError } =
        await supabase.auth.getUser();

        console.log("User Data:", userData);

      // 2. Periksa error saat mengambil data User
      if (userError) {
        // Jika ada error saat mengambil user, lempar error ini
        throw userError;
      }

      // 3. Periksa apakah user benar-benar ada
      if (!userData.user) {
        
        setUser(null); 

        return;
      }

      // 4. Set state user jika berhasil ditemukan
      setUser(userData.user);
      const userId = userData.user.id; // Kita sudah yakin user ada di sini

      // 5. Ambil data Jemaat berdasarkan userId
      const { data: jemaatData, error: jemaatError } = await supabase
        .from("jemaat")
        .select("*")
        .eq("auth_users", userId)
        .single(); // Tetap gunakan .single() jika Anda MENGHARAPKAN satu record

      // 6. Periksa error saat mengambil data Jemaat
      if (jemaatError) {
        // Periksa apakah error disebabkan oleh .single() yang tidak menemukan baris (kode PGRST116)
        if (jemaatError.code === 'PGRST116') {
          // Ini bukan error fatal aplikasi, tapi data jemaat untuk user ini tidak ada.
          console.warn(`Data jemaat tidak ditemukan untuk user ID: ${userId}. Kode: ${jemaatError.code}`);
          setJemaat(null); // Set data jemaat ke null secara eksplisit
          // Jangan throw error, karena ini kondisi yang mungkin valid
        } else {
          // Jika error lain dari database (koneksi, RLS, dll), lempar error ini
          throw jemaatError;
        }
      } else {
        // 7. Jika tidak ada error, set state jemaat
        setJemaat(jemaatData);
      }

    } catch (error) {
      // Tangkap semua error yang dilempar dari blok try
      console.error("Terjadi kesalahan saat mengambil data:", error); // Log error lengkap untuk debug
      // Set pesan error untuk ditampilkan ke pengguna
      // Anda mungkin ingin membuat pesan ini lebih ramah pengguna
      setError((error as Error).message || "Terjadi kesalahan yang tidak diketahui");
      // Pastikan state lain direset jika perlu
      setUser(null);
      setJemaat(null);
    } finally {
      // 8. Set loading menjadi false setelah selesai (baik sukses maupun error)
      setLoading(false);
    }
  };

  fetchUserAndJemaat();

}, []); // Dependency array kosong agar hanya berjalan sekali saat mount

  if (loading) return <div>Loading...</div>;
 
  if (!user) return <div>Tidak ada user yang login</div>;
  if (!jemaat) return <div>anda menggunakan email yang belum terdaftar</div>;

  console.log("NAMA", jemaat);

  return (
    <div>
      <h1>Informasi User</h1>
      <p>ID: {user.id}</p>
      <p>Email: {user.email}</p>

      <h1>Informasi Jemaat</h1>
      <p>Nama Jemaat: {jemaat?.nama_jemaat}</p>
      <Logoutbtn/>
    </div>
  );
};

export default Dashboard;
