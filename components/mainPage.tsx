// app/dashboard/page.tsx
"use client"

import { useState } from "react"
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

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false)
  
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
              <AvatarImage src="https://randomuser.me/api/portraits/women/44.jpg" alt="Sarah Johnson" />
              <AvatarFallback>SJ</AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
          </div>
          {!collapsed && (
            <div>
              <div className="font-medium">Sarah Johnson</div>
              <div className="text-xs text-muted-foreground">Admin</div>
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
            
            <MenuItem icon={<Home />} text="Dashboard" active collapsed={collapsed} />
            <MenuItem icon={<BarChart2 />} text="Analytics" collapsed={collapsed} />
            <MenuItem icon={<ShoppingCart />} text="Products" collapsed={collapsed} />
            <MenuItem icon={<Users />} text="Customers" collapsed={collapsed} />
            <MenuItem 
              icon={<MessageSquare />} 
              text="Messages" 
              collapsed={collapsed}
              badge={5}
            />
          </div>
        </nav>
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-auto">
        {/* Add your dashboard content here */}
        <div className="p-6">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome back, Sarah Johnson!</p>
          
          {/* Your dashboard content will go here */}
        </div>
      </div>
    </div>
  )
}

// MenuItem component
function MenuItem({ 
  icon, 
  text, 
  active = false, 
  collapsed = false,
  badge
}: { 
  icon: React.ReactNode, 
  text: string, 
  active?: boolean, 
  collapsed?: boolean,
  badge?: number
}) {
  return (
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
  )
}