'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signUpWithActivationCode } from '@/action/action'; // <-- Import action baru
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from 'next/link';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [activationCode, setActivationCode] = useState(''); // <-- State baru
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Panggil Server Action baru
      const result = await signUpWithActivationCode(email, password, activationCode.trim());

      if (result.success) {
        toast.success('Sign up successful! Please log in.');
        // Redirect ke halaman login setelah sign up berhasil
        router.push('/login');
      } else {
        throw new Error(result.error || 'Sign up failed. Please check your details.');
      }
    } catch (err: unknown) {
      setError(error);
      toast.error(error || 'Sign up failed.');
      console.error('Sign Up Error:', err);
      setLoading(false); // Hanya set loading false jika ada error
    }
    // Jangan set loading false jika sukses karena ada redirect
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Create Account</h2>

        <form onSubmit={handleSignUp} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
              minLength={6} // Tambahkan validasi dasar di client
            />
          </div>
          <div> {/* <-- Field Baru */}
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
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </form>

         {/* Link ke Halaman Login */}
         <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="underline hover:text-primary">
            Log In
          </Link>
        </p>

        {/* Tombol Google Sign-In sengaja tidak ditampilkan di halaman Sign Up ini */}
        {/* karena alur aktivasinya berbeda */}

      </div>
    </div>
  );
}
