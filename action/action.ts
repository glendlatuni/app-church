
"use server";

import {
  MajelisWithDetails,
  Jemaat,
  UserJemaatInfoQueryResult,
  jadwalibadah,
} from "@/lib/interface";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { z } from 'zod';

interface jemaatByActivation {
  id: string;
  auth_users: string;
  // activation_code: string;
  nama_jemaat: string;
}

// Skema validasi Zod (bisa diletakkan di atas atau di dalam fungsi jika hanya dipakai sekali)
const SignUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  // activationCode: z.string().length(8, "Activation code must be 8 characters")
});

const ActivationCodeSchema = z.string().length(8, "Activation code must be 8 characters long");


// --- SERVER ACTION BARU untuk Sign Up Email/Password/Kode --- 
export async function signUpWithActivationCode(
    emailInput: string,
    passwordInput: string,
    // activationCodeInput: string
): Promise<{ success: boolean; error?: string }> {
  
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // 1. Validasi Input Gabungan
  const validation = SignUpSchema.safeParse({
      email: emailInput,
      password: passwordInput,
      // activationCode: activationCodeInput
  });

  if (!validation.success) {
      const errors = validation.error.errors.map(e => e.message).join(', ');
      console.error("Sign Up Validation Error:", errors);
      return { success: false, error: errors || 'Invalid input.' };
  }

  const { email, password } = validation.data;

  try {
    // 2. Verifikasi Kode Aktivasi & Status Tautan Jemaat

    // const { data: jemaatData, error: selectError } = await supabase
    //   .from('jemaat')
    //   .select('id, auth_users') // Hanya perlu ID dan auth_users
    //   .eq('activation_code', activationCode)
    //   .maybeSingle();

    // if (selectError) {
    //   console.error('Error verifying activation code:', selectError);
    //   return { success: false, error: 'Database error during code verification.' };
    // }

    // if (!jemaatData) {
    //   console.warn(`Activation code not found: ${activationCode}`);
    //   return { success: false, error: 'Invalid activation code.' };
    // }

    // if (jemaatData.auth_users) {
    //   console.warn(`Activation code ${activationCode} already linked to user ${jemaatData.auth_users}`);
    //   return { success: false, error: 'This activation code has already been used.' };
    // }

    // const jemaatIdToLink = jemaatData.id; // Simpan ID jemaat

    // 3. Lakukan Sign Up ke Supabase Auth
    console.log(`Attempting Supabase signUp for email: ${email}`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      console.error('Supabase signUp Error:', signUpError);
      return { success: false, error: signUpError.message || 'Failed to create user account.' };
    }

    if (!signUpData.user) {
        console.error('Supabase signUp did not return a user object.');
        return { success: false, error: 'User account creation failed unexpectedly.' };
    }

    const newUserId = signUpData.user.id;
    console.log(`Supabase signUp successful. New User ID: ${newUserId}`);

    // 4. Update Tabel 'jemaat' - Tautkan User Auth dan Hapus Kode
    // console.log(`Linking User ID ${newUserId} to Jemaat ID ${jemaatIdToLink}`);
    // const { error: updateError } = await supabase
    //   .from('jemaat')
    //   .update({
    //     auth_users: newUserId,
    //     activation_code: null // Hapus kode setelah berhasil digunakan
    //   })
    //   .eq('id', jemaatIdToLink);

    // if (updateError) {
    //   console.error('Error updating jemaat table after signup:', updateError);
    //   // Anda mungkin ingin mencoba menghapus user auth yang baru dibuat di sini sebagai kompensasi
    //   // await supabase.auth.admin.deleteUser(newUserId); // Hati-hati, ini butuh admin client
    //   return { success: false, error: 'Account created, but failed to link to profile. Please contact support.' };
    // }

    // console.log(`Successfully linked User ${newUserId} to Jemaat ${jemaatIdToLink}.`);
    return { success: true };

  } catch (err: unknown) {
      console.error("Unexpected error in signUpWithActivationCode:", err);
      return { success: false, error: 'An unexpected server error occurred.' };
  }
}
// --- Akhir SERVER ACTION BARU ---


export async function getMajelisData(): Promise<MajelisWithDetails[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ACTION: Error fetching majelis data:", error);
      throw error;
    }
    console.log(`ACTION: Berhasil mengambil ${data?.length || 0} data majelis.`);
    return (data as unknown as MajelisWithDetails[]) || [];
  } catch (err) {
    console.error("ACTION: Kesalahan tak terduga di getMajelisData:", err);
    return [];
  }
}

export async function getJemaatDetailsById(
  jemaatId: string
): Promise<Jemaat | null> {
  if (!jemaatId || typeof jemaatId !== "string") {
    console.error("getJemaatDetailsById: Invalid jemaatId provided:", jemaatId);
    return null;
  }
  console.log(`ACTION: Fetching details for Jemaat ID: ${jemaatId}`);
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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
      .eq("id", jemaatId)
      .single();

    if (error) {
      console.error(`ACTION: Error fetching jemaat details for ID ${jemaatId}:`, error);
      return null;
    }
    console.log(`ACTION: Successfully fetched details for Jemaat ID: ${jemaatId}`);
    return data as Jemaat | null;
  } catch (err) {
    console.error(`ACTION: Unexpected error in getJemaatDetailsById for ID ${jemaatId}:`, err);
    return null;
  }
}

export async function getJemaatData(): Promise<Jemaat[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: user, error: userAuthError } = await supabase.auth.getUser();
    if (userAuthError || !user) {
      console.error("Aksi membutuhkan login:", userAuthError);
      return [];
    }
    const userId = user.user.id;

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
      // Di alur Google, ini akan mengarah ke aktivasi. Di sini, mungkin tidak masalah jika user baru login.
      return []; // Kembalikan kosong agar tidak error, tapi UI mungkin perlu menangani ini.
    }

    const userJemaatId = userJemaatInfo.id;
    const userLingkunganId = userJemaatInfo.keluarga_id?.ksp_id?.lingkungan_id?.id;
    const userGerejaId = userJemaatInfo.keluarga_id?.ksp_id?.lingkungan_id?.gereja_id;

    const { data: roleData, error: roleError } = await supabase
      .from("role")
      .select("role")
      .eq("jemaat_id", userJemaatId)
      .maybeSingle();

    if (roleError) {
      console.error("Error fetching user role:", roleError);
      return [];
    }

    const userRole = roleData?.role || "Admin";
    console.log(`User Role: ${userRole}, Lingkungan: ${userLingkunganId}, Gereja: ${userGerejaId}`);

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
      `);

    if (userRole === "Superadmin") {
      if (!userGerejaId) {
        console.warn("Filtering DB: Role Superadmin - User has no Gereja ID. Returning empty.");
        return [];
      }
      console.log(`Filtering DB: Role Superadmin - by Gereja ID: ${userGerejaId}`);
      query = query.eq("keluarga_id.ksp_id.lingkungan_id.gereja_id", userGerejaId);
    } else if (userRole === "Admin") {
      if (!userLingkunganId) {
        console.warn("Filtering DB: Role Admin/Null - User has no Lingkungan ID. Returning empty.");
        return [];
      }
      console.log(`Filtering DB: Role Admin/Null - by Lingkungan ID: ${userLingkunganId}`);
      query = query.eq("keluarga_id.ksp_id.lingkungan_id.id", userLingkunganId);
    } else if (userRole !== "God") {
      console.warn(`Role tidak dikenal atau filter tidak bisa diterapkan: ${userRole}`);
      return [];
    }

    const { data: filteredJemaat, error: filterError } = await query;

    if (filterError) {
      console.error("Error executing filtered query:", filterError);
      return [];
    }

    console.log(`Query successful, returning ${filteredJemaat?.length || 0} records.`);
    return filteredJemaat as unknown as Jemaat[] || [];
  } catch (error) {
    console.error("Unexpected error in getJemaatData:", error);
    return [];
  }
}

export async function getJadwal(): Promise<jadwalibadah[]> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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

// Fungsi login standar (tetap berguna)
export async function loginWithEmailPassword(email: string, password: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Login error:", error.message);
      return { success: false, error: error.message };
    }
    // Setelah login berhasil, middleware/redirecting akan menangani cek aktivasi jika diperlukan
    return { success: true, data };
  } catch (error) {
    console.error("Unexpected error during login:", error);
    return { success: false, error: error instanceof Error ? error.message : "Terjadi kesalahan saat login" };
  }
}

// Fungsi signIn lama (mungkin tidak diperlukan jika signUpWithActivationCode menggantikannya)
/*
export async function signIn(email: string, password: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/verify`
      }
    });
    // ... error handling ...
  } catch (error) {
    // ... error handling ...
  }
}
*/

// Fungsi Google Sign In (tetap berguna)
export async function googleSigin() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const origin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${origin}/auth/callback` // Middleware akan menangani ini
      }
    });

    if (error) {
      console.error("Google Signin error:", error.message);
      return { success: false, error: error.message };
    }
    return { success: true, data }; // Menginisiasi redirect
  } catch (error) {
    console.error("Unexpected error during Google signin:", error);
    return { success: false, error: error instanceof Error ? error.message : "Terjadi kesalahan saat Google signin" };
  }
}

export async function getUser(): Promise<{ user: User | null, error: string | null }> {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      return { user: null, error: sessionError?.message || null };
    }
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) {
      console.error("Error fetching user:", error);
      return { user: null, error: error.message };
    }
    return { user, error: null };
  } catch (error: unknown) {
    console.error("Unexpected error in getUser:", error);
    return { user: null, error: "Unexpected error occurred getting user" };
  }
}

export async function getJemaatInfo(userId: string): Promise<{ jemaat: Jemaat | null, error: string | null }> {
  if (!userId) return { jemaat: null, error: "User ID is required." };
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  try {
    const { data: jemaatData, error: jemaatError } = await supabase
      .from("jemaat")
      .select("*") // Anda bisa memilih kolom spesifik jika perlu
      .eq("auth_users", userId)
      .single();

    if (jemaatError) {
      if (jemaatError.code === 'PGRST116') {
        return { jemaat: null, error: null };
      } else {
        console.error("Error fetching jemaat data:", jemaatError);
        return { jemaat: null, error: jemaatError.message };
      }
    }
    return { jemaat: jemaatData as Jemaat, error: null };
  } catch (error) {
    console.error("Unexpected error in getJemaatInfo:", error);
    return { jemaat: null, error: "Unexpected error occurred getting jemaat info" };
  }
}

// --- Fungsi counting tetap sama ---
export async function countData(){
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore)

  const {count, error} = await supabase.from('jemaat').select('*',{count:'exact', head: true})

  if (error){
    console.log("where the fuck is data")
  }
return count
}

export async function countGender(gender:string){
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore)

  const {count, error} = await supabase.from('jemaat').select('*',{count:'exact', head: true}).eq('jenis__kelamin', gender)

  if (error){
    console.log("where the fuck is data")
  }
return count
}

export async function countByCategory(category:string){
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore)

  const {count, error} = await supabase.from('jemaat').select('*',{count:'exact', head: true}).eq('kategori', category)

  if (error){
    console.log("where the fuck is data")
  }
return count
  }

// Fungsi activateAccount (ini masih diperlukan untuk alur Google Sign In)
export async function activateAccount(code: string): Promise<{ success: boolean; error?: string; jemaatData?: jemaatByActivation }> {
  console.log(`Activating account with code: ${code}`);

  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const validation = ActivationCodeSchema.safeParse(code);
  if (!validation.success) {
    return { success: false, error: validation.error.errors[0]?.message || 'Invalid activation code format.' };
  }
  const validatedCode = validation.data;

  // 1. Dapatkan user yang sedang login (dari sesi Google)
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    console.error('Authentication Error in activateAccount (likely Google flow):', authError);
    return { success: false, error: 'User session not found. Please log in again.' };
  }

  // 2. Cari jemaat berdasarkan KODE AKTIVASI
  const { data: jemaatData, error: selectError } = await supabase
    .from('jemaat')
    .select('id, auth_users, activation_code, nama_jemaat')
    .eq('activation_code', validatedCode)
    .maybeSingle();





  if (selectError) {
    console.error('Error fetching jemaat by activation code:', selectError);
    return { success: false, error: 'Database error checking activation code.' };
  }

  if (!jemaatData) {
    return { success: false, error: 'Invalid or expired activation code.' };
  }

  // 3. Periksa apakah kode sudah ditautkan ke user LAIN
  if (jemaatData.auth_users && jemaatData.auth_users !== user.id) {
     return { success: false, error: 'This activation code is already linked to another user.' };
  }
  
  // 4. Periksa apakah USER ini sudah tertaut ke jemaat LAIN (opsional tapi bagus)
  const { data: existingLink, error: existingLinkError } = await supabase
    .from('jemaat')
    .select('id')
    .eq('auth_users', user.id)
    .maybeSingle();

  if (existingLinkError) {
      console.error('Error checking existing user link:', existingLinkError);
      // Lanjutkan proses, tapi waspadai potensi masalah
  } else if (existingLink && existingLink.id !== jemaatData.id) {
      // User ini sudah tertaut ke record jemaat yang berbeda
      return { success: false, error: 'Your login is already linked to a different profile.' };
  }

  // 5. Update Jemaat: Tautkan user saat ini dan hapus kode
  let updateError = null;
  if (jemaatData.auth_users !== user.id) { // Hanya update jika belum tertaut
      console.log(`Linking user ${user.id} to jemaat ${jemaatData.id} via activateAccount`);
      const { error } = await supabase
          .from('jemaat')
          .update({ auth_users: user.id, activation_code: null })
          .eq('id', jemaatData.id);
      updateError = error;
  } else if (jemaatData.activation_code !== null) { // Jika sudah tertaut, tapi kode belum null
       console.log(`User ${user.id} already linked to jemaat ${jemaatData.id}. Clearing code.`);
       const { error } = await supabase
          .from('jemaat')
          .update({ activation_code: null })
          .eq('id', jemaatData.id);
       if (error) console.warn(`Could not clear activation code for already linked jemaat ${jemaatData.id}:`, error);
       // Tidak menganggap ini error fatal
  }

  if (updateError) {
    console.error('Error updating jemaat auth_users in activateAccount:', updateError);
    if (updateError.code === '23505') { // Unique constraint violation
        return { success: false, error: 'This login is already linked to another jemaat record (conflict).' };
    }
    return { success: false, error: `Failed to link account: ${updateError.message}` };
  }

  return { success: true, jemaatData };
}

// Fungsi checkActivationStatus (masih diperlukan untuk alur Google Sign In)
export async function checkActivationStatus(): Promise<{ isActivated: boolean; error?: string }> {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return { isActivated: false, error: 'Not authenticated' };
    }

    const { data, error: checkError } = await supabase
        .from('jemaat')
        .select('id')
        .eq('auth_users', user.id)
        .limit(1)
        .maybeSingle();

    if (checkError) {
        console.error('Error checking activation status:', checkError);
        return { isActivated: false, error: `Database error checking activation: ${checkError.message}` };
    }

    return { isActivated: data !== null };
}
