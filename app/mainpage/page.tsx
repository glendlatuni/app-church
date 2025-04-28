// app/dashboard/page.tsx
export default function DashboardPage() {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, Sarah Johnson!</p>
        
        {/* Your dashboard content here */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium">Total Sales</h2>
            <p className="text-3xl font-bold mt-2">$12,345</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium">New Customers</h2>
            <p className="text-3xl font-bold mt-2">234</p>
          </div>
          
          <div className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium">Active Orders</h2>
            <p className="text-3xl font-bold mt-2">56</p>
          </div>
        </div>
      </div>
    )
  }