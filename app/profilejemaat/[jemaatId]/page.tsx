import { notFound } from "next/navigation"
import type { Jemaat } from "@/lib/interface"
import { getJemaatDetailsById } from "@/action/action"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface JemaatProfileProps {
  params: { jemaatId: string }
}

export default async function JemaatProfile({ params }: JemaatProfileProps) {
  const { jemaatId } = params

  const jemaat: Jemaat | null = await getJemaatDetailsById(jemaatId)

  if (!jemaat) {
    return notFound()
  }

  // Function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="container mx-auto py-6 max-w-3xl">
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            {/* Avatar component - will support photo URL in the future */}
            <Avatar className="h-24 w-24">
              {/* 
                TODO: Add support for profile photo
                {jemaat.photo_url ? (
                  <AvatarImage src={jemaat.photo_url || "/placeholder.svg"} alt={jemaat.nama_jemaat} />
                ) : (
                  <AvatarFallback>{getInitials(jemaat.nama_jemaat)}</AvatarFallback>
                )}
              */}
              <AvatarFallback className="text-xl">{getInitials(jemaat.nama_jemaat)}</AvatarFallback>
            </Avatar>

            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{jemaat.nama_jemaat}</h1>
              <p className="text-muted-foreground">ID: {jemaat.id}</p>

              {/* Status badges */}
              <div className="flex flex-wrap gap-2 mt-2">
                {jemaat.status_baptis && (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Baptis
                  </Badge>
                )}
                {jemaat.status_sidi && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Sidi
                  </Badge>
                )}
                {jemaat.kategori && <Badge variant="secondary">{jemaat.kategori}</Badge>}
              </div>
            </div>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-6">
          {/* Personal Information Section */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Informasi Pribadi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Nama Lengkap" value={jemaat.nama_jemaat} />
              <InfoItem label="Tempat Lahir" value={jemaat.tempat_lahir} />
              <InfoItem label="Tanggal Lahir" value={jemaat.tanggal_lahir} />
              <InfoItem label="Jenis Kelamin" value={jemaat.jenis__kelamin} />

              {/* 
                Additional fields can be added here
                <InfoItem label="Email" value={jemaat.email} />
                <InfoItem label="Nomor Telepon" value={jemaat.phone} />
              */}
            </div>
          </div>

          {/* Family Information Section */}
          {jemaat.keluarga_id && (
            <>
              <Separator className="my-4" />

              <div className="mt-6">
                <h2 className="text-lg font-semibold mb-3">Informasi Keluarga & Wilayah</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    label="Keluarga"
                    value={`${jemaat.keluarga_id.nama_keluarga}`}
                    subvalue={`ID: ${jemaat.keluarga_id.id}`}
                  />

                  {jemaat.keluarga_id.ksp_id && (
                    <InfoItem
                      label="KSP"
                      value={`${jemaat.keluarga_id.ksp_id.ksp}`}
                      subvalue={`ID: ${jemaat.keluarga_id.ksp_id.id}`}
                    />
                  )}

                  {jemaat.keluarga_id.ksp_id?.lingkungan_id && (
                    <InfoItem
                      label="Lingkungan"
                      value={`${jemaat.keluarga_id.ksp_id.lingkungan_id.lingkungan}`}
                      subvalue={`ID: ${jemaat.keluarga_id.ksp_id.lingkungan_id.id}`}
                    />
                  )}

                  {/* 
                    Additional fields for gereja can be added here
                    {jemaat.keluarga_id.ksp_id?.lingkungan_id?.gereja_id && (
                      <InfoItem 
                        label="Gereja" 
                        value={jemaat.keluarga_id.ksp_id.lingkungan_id.gereja_id.nama_gereja} 
                        subvalue={`ID: ${jemaat.keluarga_id.ksp_id.lingkungan_id.gereja_id.id}`}
                      />
                    )}
                  */}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Helper component for displaying information items
function InfoItem({
  label,
  value,
  subvalue,
}: {
  label: string
  value: string | undefined | null
  subvalue?: string
}) {
  if (!value) return null

  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
      {subvalue && <p className="text-xs text-muted-foreground">{subvalue}</p>}
    </div>
  )
}
