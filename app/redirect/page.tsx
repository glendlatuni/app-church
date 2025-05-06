'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkActivationStatus } from '@/action/action'; // Import action checker
import { Skeleton } from '@/components/ui/skeleton'; // Komponen loading

export default function RedirectingPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Checking your account status...');
  // const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatusAndRedirect = async () => {
      try {
        // Panggil Server Action untuk memeriksa apakah user sudah terhubung ke data jemaat
        const { isActivated, error } = await checkActivationStatus();

        if (error && error !== 'Not authenticated') { // Abaikan error not authenticated jika user belum login
          setMessage(`Error: ${error}. Redirecting to login...`);
           setTimeout(() => router.push('/login'), 3000);
           return;
        }

        if (isActivated) {
          setMessage('Account verified. Redirecting to dashboard...');
          // Pengguna sudah teraktivasi/tertaut, arahkan ke halaman utama
           setTimeout(() => router.push('/'), 1500); // Redirect ke /
        } else {
          setMessage('Account activation required. Redirecting...');
          // Pengguna belum teraktivasi/tertaut, arahkan ke halaman aktivasi
           setTimeout(() => router.push('/activate'), 1500); // Redirect ke /activate
        }
      } catch (err: unknown) {
        console.error('Redirection check failed:', err);
        setMessage('An unexpected error occurred. Redirecting to login...');
         setTimeout(() => router.push('/login'), 3000);
      } finally {
         // setIsLoading(false); // Loading bisa dimatikan jika perlu interaksi lain
      }
    };

    checkStatusAndRedirect();
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
       {/* Tampilkan loading skeleton atau spinner */}
       <Skeleton className="h-8 w-64 rounded-md" />
       <Skeleton className="h-4 w-48 rounded-md" />
       <p className="text-muted-foreground">{message}</p>
       {/* Anda bisa menambahkan logo atau animasi loading di sini */}
    </div>
  );
}
