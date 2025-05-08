
export interface Gereja {
    id: string; 
    nama_gereja: string;
}

export interface Lingkungan {
    id: string; 
    lingkungan: string;
    gereja_id?: string | null; 
}

export interface ksp {
    id: string; 
    ksp: string;
    lingkungan_id : Lingkungan | null; 
}

export interface Keluarga {
    id: string; 
    nama_keluarga: string;
    jemaat :{
        id : string;
        nama_jemaat : string;
    };
    alamat:{
      id : string;
      alamat_ibadah: string;
    }

    ksp_id : ksp | null; 
}


export interface Jemaat {
    id: string;
    nama_jemaat: string;
    tempat_lahir: string;
    tanggal_lahir: string;
    kategori: string;
    status_sidi: boolean;
    status_baptis: boolean;
    jenis__kelamin: string;
    keluarga_id : {
        id: string; // OK
        nama_keluarga: string;
        alamat:{
            id : string;
            alamat_ibadah: string;
        }
        ksp_id : {
            id: string; // OK
            ksp: string;
            lingkungan_id : {
                id: string; // OK
                lingkungan: string;
                gereja_id: string | null;
            } | null; // nullability OK
        } | null; // nullability OK
    } | null; // nullability OK
}

// Interface Role sudah menggunakan string untuk ID, OK.
export interface Role {
    id: string;
    created_at: string;
    role: 'Admin' | 'Superadmin' | 'God' | null;
    jemaat_id: string | null;
    update_at: string | null;
}


export interface UserJemaatInfoQueryResult {
    id: string;
    keluarga_id: {
      ksp_id: {
        lingkungan_id: {
          id: string;
          gereja_id: string | null;
        } | null; // lingkungan_id bisa null jika relasi tidak ada
      } | null; // ksp_id bisa null
    } | null; // keluarga_id bisa null
  }


  export interface pelayanFirman{
    id : string;
    titel : string;
    jemaat_id : {
        id : string;
        nama_jemaat: string;

    }

  }



  export interface MajelisWithDetails{
    id: string;
    titel: string | null;
    status: boolean | null;
    jemaat_id:{
      id: string;
      nama_jemaat: string;
      keluarga_id: {
          id: string;
          nama_keluarga: string;
          ksp_id: {
              id: string;
              ksp: string;
              lingkungan_id: {
                  id: string;
                  lingkungan: string;
                  gereja_id: string | null;
              } | null;
          } | null;
      } | null;
    } | null;
  }





  export interface jadwalibadah{
    id : string;
    tanggal : string;
    tempat_ibadah : Jemaat | null;
    pelayan_firman: {
      id : string;
      titel : string;
      jemaat_id: {
        id: string;
        nama_jemaat: string;
      }
    }

    }

    
    
    export interface ListItemProps {
      title: string;
      subtitle?: string;
      value?: string;
      icon?: React.ReactNode;
    }