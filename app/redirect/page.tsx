"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle, ArrowRight } from "lucide-react"

export default function RedirectPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(3)

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/")
    }, 3000)

    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => {
      clearTimeout(timer)
      clearInterval(interval)
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <Card className="w-full max-w-md border-black/10 shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-black text-white">
            <CheckCircle className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl font-bold">Pendaftaran Berhasil!</CardTitle>
          <CardDescription className="text-gray-500">Akun Anda telah berhasil dibuat</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="mb-3 flex justify-center">
              <Mail className="h-8 w-8 text-black" />
            </div>
            <p className="text-sm text-gray-600">
              Silakan periksa email Anda untuk mengaktifkan akun dan melanjutkan proses pendaftaran.
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Anda akan dialihkan ke halaman utama dalam <span className="font-bold text-black">{countdown}</span> detik
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-black text-white hover:bg-gray-800" onClick={() => router.push("/")}>
            Kembali ke Halaman Utama
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
