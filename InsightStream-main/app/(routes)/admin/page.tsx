"use client"
import { useState, useEffect } from 'react'
import { Loader2, Users, Image as ImageIcon, FileText, TrendingUp, LogOut } from 'lucide-react'
import axios from 'axios'

function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>(null)

  const handleLogin = async () => {
    setLoading(true)
    try {
      const response = await axios.post('/api/admin-login', { username, password })
      if (response.data.success) {
        setIsLoggedIn(true)
        fetchStats()
      } else {
        alert('Invalid credentials')
      }
    } catch (error) {
      alert('Login failed')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin-stats')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Failed to fetch stats')
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-2xl w-full max-w-md">
          <h2 className="text-3xl font-bold text-center mb-6">Admin Login</h2>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              className="w-full p-3 border rounded-lg outline-none bg-transparent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 border rounded-lg outline-none bg-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white p-3 rounded-lg font-semibold hover:from-red-600 hover:to-orange-600 transition-all"
            >
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Login'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => setIsLoggedIn(false)}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>

      {!stats ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="animate-spin h-10 w-10 text-red-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Total Users</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.totalUsers}</h3>
                </div>
                <Users size={48} className="opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Thumbnails Generated</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.totalThumbnails}</h3>
                </div>
                <ImageIcon size={48} className="opacity-50" />
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Content Generated</p>
                  <h3 className="text-4xl font-bold mt-2">{stats.totalContent}</h3>
                </div>
                <FileText size={48} className="opacity-50" />
              </div>
            </div>
          </div>

          {/* Most Active Users */}
          <div className="bg-secondary p-6 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-red-500" />
              Most Active Users
            </h3>
            <div className="space-y-3">
              {stats.activeUsers?.map((user: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-background p-4 rounded-lg">
                  <span className="font-semibold">{user.email}</span>
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm">
                    {user.count} generations
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Users */}
          <div className="bg-secondary p-6 rounded-xl">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Users className="text-blue-500" />
              Recent Users
            </h3>
            <div className="space-y-3">
              {stats.recentUsers?.map((user: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center bg-background p-4 rounded-lg">
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-sm text-gray-400">{user.email}</p>
                  </div>
                  <span className="text-sm text-gray-400">ID: {user.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
