"use server";

// actions/action.ts (atau lokasi Server Action Anda)

import {
  MajelisWithDetails,
  Jemaat,
  UserJemaatInfoQueryResult,
  jadwalibadah,
} from "@/lib/interface"; // Pastikan path interface benar
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { User } from "@supabase/supabase-js";

export async function getMajelisData(): Promise<MajelisWithDetails[]> {
  const supabase = await createClient();

  // !!! PERTIMBANGKAN FILTERING DI SINI !!!
  // Saat ini mengambil SEMUA majelis. Apakah perlu difilter berdasarkan
  // role user yang login (misal: hanya majelis di lingkungan/gereja user)?
  // Jika ya, implementasikan logika get user & role seperti di getJemaatData.
  // Untuk contoh ini, kita ambil semua dulu.

  try {
    // Query dimulai dari tabel 'majelis'
    // Gunakan select bersarang untuk mengambil data terkait
    // Ubah nama kolom foreign key 'jemaat_id' menjadi objek 'jemaat' di hasil
    const { data, error } = await supabase
      .from("majelis")
      .select(
        `
        id,
        titel,
        status,
        jemaat_id(
          id,
          nama_jemaat,
          keluarga_id(
            id,
            ksp_id (
              id,
              ksp,
              lingkungan_id (
                id,
                lingkungan,
                gereja_id
              )
            )
          )
        )
      `
      )
      // Hapus .order() jika tidak perlu sorting spesifik, atau sesuaikan
      .order("created_at", { ascending: false }); // Contoh: Urutkan berdasarkan data terbaru

    if (error) {
      console.error("ACTION: Error fetching majelis data:", error);
      // Melempar error agar bisa ditangkap di client jika perlu penanganan khusus
      throw error;
      // atau return []; jika ingin silent fail
      // return [];
    }

    console.log(
      `ACTION: Berhasil mengambil ${data?.length || 0} data majelis.`
    );

    // Gunakan type assertion untuk memberitahu TypeScript strukturnya
    return (data as unknown as MajelisWithDetails[]) || [];
  } catch (err) {
    console.error("ACTION: Kesalahan tak terduga di getMajelisData:", err);
    return []; // Kembalikan array kosong jika ada error tak terduga
  }
}

export async function getJemaatDetailsById(
  jemaatId: string
): Promise<Jemaat | null> {
  // Validasi dasar ID (opsional tapi bagus)
  if (!jemaatId || typeof jemaatId !== "string") {
    console.error("getJemaatDetailsById: Invalid jemaatId provided:", jemaatId);
    return null;
  }

  console.log(`ACTION: Fetching details for Jemaat ID: ${jemaatId}`);
  const supabase = await createClient(); // Gunakan server client

  try {
    const { data, error } = await supabase
      .from("jemaat")
      .select(
        `
        *,
        keluarga_id (
          *, 
          ksp_id (
            *, 
            lingkungan_id ( 
              * 
              
            )
          )
        )
      `
      )
      .eq("id", jemaatId) // Filter berdasarkan ID jemaat yang diberikan
      .single(); // Harapkan HANYA SATU hasil

    if (error) {
      // Tangani error, misal ID tidak valid, atau tidak ditemukan (PGRST116 dari .single())
      console.error(
        `ACTION: Error fetching jemaat details for ID ${jemaatId}:`,
        error
      );
      return null;
    }

    console.log(
      `ACTION: Successfully fetched details for Jemaat ID: ${jemaatId}`
    );
    // Koreksi tipe jika diperlukan, meskipun .single() & select mungkin sudah benar
    return data as Jemaat | null;
  } catch (err) {
    console.error(
      `ACTION: Unexpected error in getJemaatDetailsById for ID ${jemaatId}:`,
      err
    );
    return null;
  }
}



export async function getJemaatData(): Promise<Jemaat[]> {
  const supabase = await createClient();
  const cookieStore = await cookies(); // Dapatkan cookie store
  console.log(
    "SERVER ACTION COOKIES:",
    JSON.stringify(cookieStore.getAll(), null, 2)
  ); // Log cookies

  try {
    // 1. Dapatkan User Auth
    const { data: user, error: userAuthError } = await supabase.auth.getUser();
    if (userAuthError || !user) {
      console.error("Aksi membutuhkan login:", userAuthError);
      return [];
    }
    const userId = user.user.id;

    // 2. Dapatkan Data Jemaat User (termasuk ID kunci & jemaat_id)
    const { data, error: userJemaatError } = await supabase
      .from("jemaat")
      .select(
        `
        id,
        keluarga_id (
          ksp_id (
            lingkungan_id (
              id,
              gereja_id
            )
          )
        )
      `
      )
      .eq("auth_users", userId)
      .maybeSingle();

    const userJemaatInfo = data as UserJemaatInfoQueryResult | null;

    if (userJemaatError) {
      console.error("Error fetching user's jemaat data:", userJemaatError);
      return [];
    }
    if (!userJemaatInfo) {
      console.warn(`User auth ${userId} tidak terhubung dengan data jemaat.`);
      return [];
    }

    const userJemaatId = userJemaatInfo.id;
    const userLingkunganId =
      userJemaatInfo.keluarga_id?.ksp_id?.lingkungan_id?.id;
    const userGerejaId =
      userJemaatInfo.keluarga_id?.ksp_id?.lingkungan_id?.gereja_id;

    // 3. Dapatkan Role User dari tabel 'role'
    const { data: roleData, error: roleError } = await supabase
      .from("role")
      .select("role")
      .eq("jemaat_id", userJemaatId)
      .maybeSingle();

    if (roleError) {
      console.error("Error fetching user role:", roleError);
      return [];
    }

    // Tentukan role user. Jika null, anggap sebagai 'Admin'.
    const userRole = roleData?.role || "Admin"; // Default ke 'Admin' jika role null
    console.log(
      `User Role: ${userRole}, Lingkungan: ${userLingkunganId}, Gereja: ${userGerejaId}`
    );

    // 4. Bangun Query Dinamis berdasarkan Role (HAPUS FETCH ALLJEMAAT)
    let query = supabase.from("jemaat").select(`
        id, nama_jemaat, tempat_lahir, tanggal_lahir,kategori,
        keluarga_id!inner (  
          id, nama_keluarga,
          ksp_id!inner (
            id, ksp,      
            lingkungan_id!inner ( 
              id, lingkungan, gereja_id
            )
          )
        )
      `); // Select statement dasar

    // Terapkan filter database berdasarkan role
    if (userRole === "Superadmin") {
      if (!userGerejaId) {
        console.warn(
          "Filtering DB: Role Superadmin - User has no Gereja ID. Returning empty."
        );
        return []; // Perlu Gereja ID
      }
      console.log(
        `Filtering DB: Role Superadmin - by Gereja ID: ${userGerejaId}`
      );
      query = query.eq(
        "keluarga_id.ksp_id.lingkungan_id.gereja_id",
        userGerejaId
      );
    } else if (userRole === "Admin") {
      // Kondisi disederhanakan (mencakup null)
      if (!userLingkunganId) {
        console.warn(
          "Filtering DB: Role Admin/Null - User has no Lingkungan ID. Returning empty."
        );
        return []; // Perlu Lingkungan ID
      }
      console.log(
        `Filtering DB: Role Admin/Null - by Lingkungan ID: ${userLingkunganId}`
      );
      query = query.eq("keluarga_id.ksp_id.lingkungan_id.id", userLingkunganId);
    } else if (userRole !== "God") {
      // Role tidak dikenal atau tidak valid, kembalikan kosong
      console.warn(
        `Role tidak dikenal atau filter tidak bisa diterapkan: ${userRole}`
      );
      return [];
    }
    // Jika 'God', tidak ada filter tambahan yang diterapkan.

    const { data: filteredJemaat, error: filterError } = await query;

    if (filterError) {
      console.error("Error executing filtered query:", filterError);
      return [];
    }

    console.log(
      `Query successful, returning ${filteredJemaat?.length || 0} records.`
    );

    
    // Pastikan data yang dikembalikan sesuai dengan Tipe Promise<Jemaat[]>
    // Supabase client biasanya sudah mengembalikan tipe yang sesuai jika select cocok
    return filteredJemaat as unknown as Jemaat[]  || [];
  } catch (error) {
    console.error("Unexpected error in getJemaatData:", error);
    return [];
  }
}

export async function getJadwal(): Promise<jadwalibadah[]> {
  const supabase = await createClient();

  try {
    const { data: jadwalData, error: jadwalError } = await supabase
      .from("jadwal_ibadah")
      .select(
        `     id, 
              tanggal, 
              tempat_ibadah!inner(
                  id,
                  nama_jemaat,
                  kategori,
                  keluarga_id!inner (
                      id,
                      alamat!inner(
                          id,
                          alamat_ibadah
                      )
                    )
                  ), 
              pelayan_firman!inner(
                  id, 
                  titel, 
                  jemaat_id!inner (
                        id, 
                        nama_jemaat 
                    ))`
      )
      .order("tanggal", { ascending: true });

    if (jadwalError) {
      console.error("Error fetching jadwal ibadah:", jadwalError);
      return [];
    }

    return jadwalData as unknown as jadwalibadah[] || [];
  } catch (error) {
    console.error("Unexpected error in getJadwal:", error);
    return [];
  }
}



export async function loginWithEmailPassword(email: string, password: string) {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error.message)
      return { success: false, error: error.message }
    }

    // Jika berhasil
    return { success: true, data }
  } catch (error) {
    console.error("Unexpected error during login:", error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Terjadi kesalahan saat login" 
    }
  }
}



export async function getUser(): Promise<{ user: User | null, error: string | null }> {
  const supabase = await createClient();

  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    // First check if there's a session before trying to get the user
    if (sessionError || !sessionData.session) {
      // Return null user without error if there's simply no session
      return { user: null, error: null };
    }

    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      console.error("Error fetching user:", error);
      return { user: null, error: error.message };
    }

    return { user, error: null };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Only log this as an error if it's not an AuthSessionMissingError
    if (error?.__isAuthError && error?.message?.includes('Auth session missing')) {
      return { user: null, error: null }; // Return without error for missing auth
    }
    
    console.error("Unexpected error in getUser:", error);
    return { user: null, error: "Unexpected error occurred" };
  }
}



export async function getJemaatInfo(userId: string): Promise<{ jemaat: Jemaat | null, error: string | null }> {
  const supabase = await createClient();

  try {
    const { data: jemaatData, error: jemaatError } = await supabase
      .from("jemaat")
      .select("*")
      .eq("auth_users", userId)
      .single();

    if (jemaatError) {
      if (jemaatError.code === 'PGRST116') {
        console.warn(`Data jemaat tidak ditemukan untuk user ID: ${userId}`);
        return { jemaat: null, error: null };
      } else {
        console.error("Error fetching jemaat data:", jemaatError);
        return { jemaat: null, error: jemaatError.message };
      }
    }

    return { jemaat: jemaatData as Jemaat, error: null };
  } catch (error) {
    console.error("Unexpected error in getJemaatData:", error);
    return { jemaat: null, error: "Unexpected error occurred" };
  }
}