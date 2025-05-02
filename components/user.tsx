// components/auth-user.tsx
'use client'

import { useAuth } from '@/context/auth-context'

const AuthUser = () => {
  const { user, jemaat, loading, refreshUser } = useAuth()

  if (loading) {
    return (
      <div className="p-4 border rounded shadow">
        <div className="animate-pulse">Loading auth data...</div>
        <button 
          onClick={() => refreshUser()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Refresh Manually
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded shadow">
    <h3 className="font-bold text-lg mb-2">Authentication Status</h3>
    {user ? (
      <>
        <div className="mb-1">✅ User logged in: {user.email}</div>
        {jemaat ? (
          <div className="mb-1">✅ Jemaat info: {jemaat.nama_jemaat}</div>
        ) : (
          <div className="mb-1 text-yellow-600">⚠️ Jemaat info not available</div>
        )}
      </>
    ) : (
      <div className="text-red-500">❌ Not logged in</div>
    )}
    <button 
      onClick={() => refreshUser()} 
      className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
    >
      Refresh Auth Status
    </button>
  </div>
  )
}

export default AuthUser