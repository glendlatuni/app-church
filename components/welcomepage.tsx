/* eslint-disable @typescript-eslint/no-unused-vars */
// components/WelcomePage.tsx
'use client'

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { Jemaat } from '@/lib/interface';
import { supabase } from '@/utils/supabase/client';

// Import UI components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, LogOut, ChevronRight } from 'lucide-react';

interface WelcomePageProps {
  initialUser: User | null;
  initialJemaat: Jemaat | null;
  userError: string | null;
  jemaatError: string | null;
}

export default function WelcomePage({ 
  initialUser, 
  initialJemaat,
  userError,
  jemaatError
}: WelcomePageProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [jemaat, setJemaat] = useState<Jemaat | null>(initialJemaat);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN'&& !user) {
          window.location.reload(); // Reload to get the updated server data
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setJemaat(null);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setJemaat(null);
      // Using replace instead of push to prevent back navigation to logged-in state
      router.replace('/');
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="text-center space-y-2">
              <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                  Welcome to Jemaat Portal
                </span>
              </h1>
              <p className="text-slate-400 max-w-lg mx-auto">
                Your modern platform for community connection and management
              </p>
            </div>
            
            {user ? (
              <Card className="border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`} />
                        <AvatarFallback className="bg-blue-600">
                          {user.email?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-white">
                          {jemaat?.nama_jemaat || "Welcome"}
                        </CardTitle>
                        <CardDescription className="text-slate-400">
                          {user.email}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="border-green-500 text-green-500">
                      Active Session
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {jemaat ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <p className="text-sm text-slate-400">Nama Jemaat</p>
                        <p className="text-white">{jemaat.nama_jemaat}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-400">Tempat Lahir</p>
                        <p className="text-white">{jemaat.tempat_lahir}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-slate-400">Tanggal Lahir</p>
                        <p className="text-white">{jemaat.tanggal_lahir}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-yellow-500">
                        Anda menggunakan email yang belum terdaftar sebagai jemaat
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t border-slate-700 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="text-red-400 border-red-400/20 hover:bg-red-400/10"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <LogOut className="w-4 h-4 mr-2" />
                    )}
                    Logout
                  </Button>
                  <Button 
                    onClick={() => router.push('/mainpage')}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    Go to Dashboard
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <Card className="border border-slate-700 bg-slate-800/50 backdrop-blur-sm text-center">
                <CardHeader>
                  <CardTitle className="text-white">Join Our Community</CardTitle>
                  <CardDescription className="text-slate-400">
                    Sign in to access your personal dashboard and community resources
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 pb-8">
                  <div className="max-w-sm mx-auto">
                    <Button 
                      onClick={handleLogin}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                      size="lg"
                    >
                      Sign In
                    </Button>
                  </div>
                </CardContent>
                <CardFooter className="justify-center border-t border-slate-700 pt-4">
                  <p className="text-sm text-slate-400">
                    New here? Contact your administrator to get access.
                  </p>
                </CardFooter>
              </Card>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Community Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">
                    Stay connected with what happening in our community.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Events Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">
                    View upcoming events and important dates.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="border border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-lg">Resources</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">
                    Access community resources and materials.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}