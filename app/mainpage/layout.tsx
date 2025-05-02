// app/dashboard/layout.tsx
"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { 
  Home, 
  BarChart2, 
  ShoppingCart, 
  Users, 
  MessageSquare, 
  ChevronLeft, 
  ChevronRight, 
  Package 
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase/client"
import { User } from "@supabase/supabase-js"
import { Jemaat } from "@/lib/interface" 

interface DashboardLayoutProps {
  children: React.ReactNode
  initialUser?: User | null
  initialJemaat?: Jemaat | null
}

export default function DashboardLayout({
  children,
  initialUser,
  initialJemaat
}: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [user, setUser] = useState<User | null>(initialUser || null)
  const [jemaat, setJemaat] = useState<Jemaat | null>(initialJemaat || null)
  const [loading, setLoading] = useState(true)
  
  const pathname = usePathname()
  const router = useRouter()
  
  // Check for user on the client side when component mounts
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          router.push('/login')
          return
        }
        
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          
          // Get jemaat data for the user
          const { data: jemaatData, error } = await supabase
            .from("jemaat")
            .select("*")
            .eq("auth_users", user.id)
            .single()
            
          if (!error && jemaatData) {
            setJemaat(jemaatData as Jemaat)
          }
        } else {
          router.push('/login')
        }
      } catch (error) {
        console.error("Error checking user:", error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    if (!initialUser) {
      checkUser()
    } else {
      setLoading(false)
    }
  }, [initialUser, router])
  
  // Listen for auth state changes
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/')
        }
      }
    )
    
    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])
  
  const menuItems = [
    { icon: <Home />, text: "Mainpage", href: "/mainpage" },
    { icon: <BarChart2 />, text: "Data Jemaat", href: "/mainpage/datajemaat" },
    { icon: <ShoppingCart />, text: "Products", href: "/mainpage/products" },
    { icon: <Users />, text: "Customers", href: "/mainpage/customers" },
    { icon: <MessageSquare />, text: "Messages", href: "/mainpage/messages", badge: 5 },
  ]
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }
  
  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <div 
        className={cn(
          "bg-card text-card-foreground shadow-lg flex flex-col transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64"
        )}
      >
        {/* Logo Section */}
        <div className="p-4 flex items-center justify-between border-b">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-primary" />
            {!collapsed && <span className="text-xl font-bold">AdminPro</span>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* User Profile */}
        <div className={cn("p-4 flex items-center border-b", collapsed ? "justify-center" : "space-x-3")}>
          <div className="relative">
            <Avatar>
              <AvatarImage 
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.email || 'Guest'}`} 
                alt={jemaat?.nama_jemaat || user?.email || "User"} 
              />
              <AvatarFallback>
                {user?.email ? user.email.substring(0, 2).toUpperCase() : "GU"}
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-medium">
                {jemaat?.nama_jemaat || user?.email?.split('@')[0] || "Guest"}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email || "Not logged in"}
              </div>
            </div>
          )}
        </div>
        
        {/* Main Menu */}
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="space-y-1 px-4">
            {!collapsed && (
              <div className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-2 px-2">
                Main Menu
              </div>
            )}
            
            {menuItems.map((item) => (
              <MenuItem 
                key={item.href}
                icon={item.icon} 
                text={item.text} 
                href={item.href}
                active={pathname === item.href} 
                collapsed={collapsed} 
                badge={item.badge}
              />
            ))}
          </div>
        </nav>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}

// MenuItem component
function MenuItem({ 
  icon, 
  text, 
  href,
  active = false, 
  collapsed = false,
  badge
}: { 
  icon: React.ReactNode, 
  text: string, 
  href: string,
  active?: boolean, 
  collapsed?: boolean,
  badge?: number
}) {
  return (
    <Link href={href} className="block">
      <Button
        variant={active ? "secondary" : "ghost"}
        className={cn(
          "w-full justify-start mb-1",
          collapsed ? "px-2" : "px-3"
        )}
      >
        <span className={cn("mr-2", active ? "text-primary" : "text-muted-foreground")}>
          {icon}
        </span>
        {!collapsed && (
          <>
            <span>{text}</span>
            {badge !== undefined && (
              <Badge variant="destructive" className="ml-auto">
                {badge}
              </Badge>
            )}
          </>
        )}
        {collapsed && badge !== undefined && (
          <Badge variant="destructive" className="absolute top-1 right-1 w-4 h-4 p-0 flex items-center justify-center">
            {badge}
          </Badge>
        )}
      </Button>
    </Link>
  )
}