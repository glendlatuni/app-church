'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { checkActivationStatus } from '@/action/action'; // Import action checker
import { Skeleton } from '@/components/ui/skeleton'; // Komponen loading (sesuaikan jika path berbeda)
import { toast } from 'sonner'; // Untuk notifikasi

export default function RedirectingPage() {
  const router = useRouter();
  const [message, setMessage] = useState('Checking your account status, please wait...');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkStatusAndRedirect = async () => {
      setIsLoading(true);
      try {
        console.log('Redirecting page: Checking activation status...');
        // Panggil Server Action
        const { isActivated, error } = await checkActivationStatus();

        if (error && error !== 'Not authenticated') {
          console.error('Redirecting page error:', error);
          setMessage(`Error checking status: ${error}. Redirecting to login...`);
          toast.error(`Error: ${error}`);
          setTimeout(() => router.push('/login'), 3000);
          return;
        } else if (error === 'Not authenticated') {
           console.warn('Redirecting page: Not authenticated. Redirecting to login...');
           setMessage('Session not found. Redirecting to login...');
           toast.error('Please log in.');
           setTimeout(() => router.push('/login'), 2000);
           return;
        }

        if (isActivated) {
          console.log('Redirecting page: Account activated. Redirecting to dashboard...');
          setMessage('Account verified. Redirecting to your dashboard...');
          toast.success('Login successful!');
          // Pengguna sudah teraktivasi/tertaut, arahkan ke halaman utama
          setTimeout(() => router.push('/'), 1500); // Redirect ke /
        } else {
          console.log('Redirecting page: Account not activated. Redirecting to activation page...');
          setMessage('Account activation required. Redirecting...');
          toast.info('Please activate your account.');
          // Pengguna belum teraktivasi/tertaut, arahkan ke halaman aktivasi
          setTimeout(() => router.push('/activate'), 1500); // Redirect ke /activate
        }
      } catch (err: any) {
        console.error('Redirecting page unexpected error:', err);
        setMessage('An unexpected error occurred. Redirecting to login...');
        toast.error('An unexpected error occurred.');
        setTimeout(() => router.push('/login'), 3000);
      } finally {
         // Loading bisa dibiarkan true karena halaman ini hanya transisi
         // setIsLoading(false); 
      }
    };

    // Tambahkan sedikit delay sebelum check, kadang sesi perlu waktu propagasi
    const timer = setTimeout(checkStatusAndRedirect, 500);

    return () => clearTimeout(timer); // Cleanup timer jika komponen unmount

  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
       {/* Tampilkan loading skeleton atau spinner */}
       <Skeleton className="h-8 w-64 rounded-md" />
       <Skeleton className="h-4 w-48 rounded-md" />
       <p className="text-muted-foreground text-center px-4">{message}</p>
       {/* Anda bisa menambahkan logo atau animasi loading di sini */}
    </div>
  );
}
