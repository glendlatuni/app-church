"use client"
import { countData, countGender, countByCategory } from "@/action/action"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/context/auth-context"
import { Users, UserRound} from "lucide-react"
import { useQuery, 
 // useQueryClient 
} from "@tanstack/react-query"

export default function DashboardPage() {
  const { jemaat } = useAuth()
  
  // Use React Query for data fetching with caching
  const { data: total, isLoading: loadingTotal } = useQuery({
    queryKey: ['jemaatTotal'],
    queryFn: () => countData(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
  })
  
  const { data: pria, isLoading: loadingPria } = useQuery({
    queryKey: ['jemaatGender', 'Pria'],
    queryFn: () => countGender("Pria"),
    staleTime: 5 * 60 * 1000,
  })
  
  const { data: wanita, isLoading: loadingWanita } = useQuery({
    queryKey: ['jemaatGender', 'Wanita'],
    queryFn: () => countGender("Wanita"),
    staleTime: 5 * 60 * 1000,
  })
  
  // Categories query with structured data
  const { data: categoryData, isLoading: loadingCategories } = useQuery({
    queryKey: ['jemaatCategories'],
    queryFn: async () => {
      const [pkbCount, pamCount, pwCount, parCount] = await Promise.all([
        countByCategory("PKB"),
        countByCategory("PAM"),
        countByCategory("PW"),
        countByCategory("PAR")
      ])
      
      return {
        PKB: pkbCount,
        PAM: pamCount,
        PW: pwCount,
        PAR: parCount
      }
    },
    staleTime: 5 * 60 * 1000,
  })
  
  // Determine if any data is still loading
  const loading = loadingTotal || loadingPria || loadingWanita || loadingCategories

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, <span className="font-medium text-foreground">{jemaat?.nama_jemaat || "User"}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Jemaat Card */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-muted-foreground">Jumlah Jemaat</h2>
                  <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-3xl font-bold">{total}</p>

                </div>
              </>
            )}
          </div>
        </div>

        {/* Gender Statistics Card */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-muted-foreground">Statistik Gender</h2>
                  <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                    <UserRound className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex gap-6 items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">PRIA</p>
                    <p className="text-2xl font-bold">{pria}</p>
        
                  </div>
                  <Separator orientation="vertical" className="h-16" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">WANITA</p>
                    <p className="text-2xl font-bold">{wanita}</p>

                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Categories Card */}
        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <div className="p-6">
            {loading ? (
              <StatCardSkeleton />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-muted-foreground">Statistik Unsur</h2>
                  <div className="rounded-full bg-primary/10 p-1.5 text-primary">
                    <UserRound className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3 flex gap-6 items-center">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">PKB</p>
                    <p className="text-2xl font-bold">{categoryData?.PKB}</p>

                  </div>
                  <Separator orientation="vertical" className="h-16" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">PAM</p>
                    <p className="text-2xl font-bold">{categoryData?.PAM}</p>

                  </div>
                  <Separator orientation="vertical" className="h-16" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">PW</p>
                    <p className="text-2xl font-bold">{categoryData?.PW}</p>

                  </div>
                  <Separator orientation="vertical" className="h-16" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">PAR</p>
                    <p className="text-2xl font-bold">{categoryData?.PAR}</p>

                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCardSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-7 w-7 rounded-full" />
      </div>
      <Skeleton className="h-9 w-16 mt-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-3" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}