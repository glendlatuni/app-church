import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

import { AuthProvider } from "@/context/auth-context";
import {getUser, getJemaatInfo} from "@/action/action";
import { Jemaat } from "@/lib/interface";
import Providers from "@/context/provider";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard built with Next.js and Shadcn UI",
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const { user } = await getUser();
  let jemaat: Jemaat | null = null;
  if (user) {
    const jemaatData = await getJemaatInfo(user.id);
    jemaat = jemaatData.jemaat;
  }



  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <Providers>
        <AuthProvider initialUser={user} initialJemaat={jemaat}>
        {children}
        <Toaster />
        </AuthProvider>
        </Providers>
   
      </body>
    </html>
  );
}
