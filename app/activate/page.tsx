'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { activateAccount } from '@/action/action'; // Server Action yang akan kita buat
// Import komponen UI Anda
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; // Asumsi menggunakan sonner untuk notifikasi

export default function ActivatePage() {
  const router = useRouter();
  const [activationCode, setActivationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const result = await activateAccount(activationCode.trim()); // Panggil Server Action

      console.log("==============================",result.jemaatData?.nama_jemaat);

      if (result.success) {
        toast.success('Account activated successfully! Redirecting...');
        // Arahkan ke halaman utama setelah aktivasi berhasil
        setTimeout(() => {
            router.push('/');
            router.refresh(); // Refresh state server
        }, 2000); // Delay sebelum redirect
      } else {
        throw new Error(result.error || 'Activation failed. Please check the code.');
      }
    } catch (err: unknown) {
      setError(error);
      toast.error(error|| 'Activation failed.');
      console.error('Activation Error:', err);
      setLoading(false);
    }
    // Jangan set loading false jika sukses karena akan redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Activate Your Account</h2>
        <p className="text-center text-muted-foreground">
          Please enter the activation code provided to you to link your account.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="activationCode">Activation Code</Label>
            <Input
              id="activationCode"
              type="text"
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              required
              disabled={loading}
              maxLength={8} // Sesuaikan dengan panjang kode Anda
              placeholder="ABCDEFGH"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Activating...' : 'Activate Account'}
          </Button>
        </form>
      </div>
    </div>
  );
}
