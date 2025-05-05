'use client'
import { supabase } from '@/utils/supabase/client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
// Import komponen UI Anda (misal: Button, Input, Label)
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from 'next/link';
// import { Icons } from "@/components/icons"; // Asumsi Anda punya ikon Google

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
       // Arahkan ke halaman redirect sementara setelah login berhasil
      router.push('/redirect');
      router.refresh(); // Refresh state server
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('Login Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
       const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          // Pastikan redirect URL ini terdaftar di Supabase & Google Cloud Console
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
       if (error) throw error;
      // Pengguna akan diarahkan ke Google, lalu kembali ke /auth/callback
      // Middleware Supabase akan menangani sesi dan mengarahkan pengguna
      // Kita mungkin perlu menanganinya di /auth/callback atau middleware untuk ke /redirecting
    } catch (err: any) {
       setError(err.message || 'Google sign-in failed.');
       console.error('Google Sign-In Error:', err);
    } finally {
        // Loading mungkin tidak perlu di set false karena ada redirect
       // setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 space-y-6 bg-card text-card-foreground rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center">Sign Up</h2>

        {/* Email/Password Form */}
        <form onSubmit={handleEmailSignIn} className="space-y-4">
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
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        {/* Separator */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={loading}
        >
          {/* Ganti dengan Ikon Google jika ada */}
          {/* <Icons.google className="mr-2 h-4 w-4" /> */}
          <span className="mr-2 h-4 w-4"> G </span> {/* Placeholder icon */}
          Google
        </Button>

        {/* Tambahkan link ke halaman sign-up jika perlu */}
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signUp" className="underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
