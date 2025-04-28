/* eslint-disable @typescript-eslint/no-unused-vars */
// app/(marketing)/page.tsx
import { getUser, getJemaatInfo } from '@/action/action';
import WelcomePage from '@/components/welcomepage';
import { Jemaat } from '@/lib/interface';

export default async function Home() {
  // Use try-catch to handle any server-side errors
  try {
    const { user, error: userError } = await getUser();
    
    let jemaat: Jemaat | null = null;
    let jemaatError: string | null = null;
    
    if (user) {
      const jemaatData = await getJemaatInfo(user.id);
      jemaat = jemaatData.jemaat;
      jemaatError = jemaatData.error;
    }

    return (
      <WelcomePage 
        initialUser={user} 
        initialJemaat={jemaat} 
        userError={userError}
        jemaatError={jemaatError}
      />
    );
  } catch (error) {
    // Fallback UI in case of unexpected server errors
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col items-center justify-center p-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Welcome to Jemaat Portal</h1>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 p-6 rounded-lg">
            <p className="text-slate-300 mb-4">
              Please sign in to access your account
            </p>
            <a href="/login" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md">
              Sign In
            </a>
          </div>
        </div>
      </div>
    );
  }
}