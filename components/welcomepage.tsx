// components/WelcomePage.tsx
import { User } from '@supabase/supabase-js';
import { Jemaat } from '@/lib/interface';
import WelcomePageClient from './welcomePageClient';

interface WelcomePageProps {
  initialUser: User | null;
  initialJemaat: Jemaat | null;
  userError: string | null;
  jemaatError: string | null;
}

// Server component wrapper yang akan meneruskan props dari page ke client component
export default function WelcomePage({ 
  initialUser, 
  initialJemaat,
  userError,
  jemaatError
}: WelcomePageProps) {
  return (
    <WelcomePageClient
      initialUser={initialUser}
      initialJemaat={initialJemaat}
      userError={userError}
      jemaatError={jemaatError}
    />
  );
}