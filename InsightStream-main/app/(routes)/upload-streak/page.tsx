"use client"
import { Calendar, Search, TrendingUp, Video, Zap } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

function UploadStreakPage() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [channelUrl, setChannelUrl] = useState('')
  const [showInput, setShowInput] = useState(true)

  const fetchStreakData = async (url?: string) => {
    const urlToUse = url || channelUrl
    if (!urlToUse.trim()) {
      alert('Please enter your YouTube channel URL')
      return
    }

    setLoading(true)
    try {
      const response = await axios.get(`/api/upload-streak?channelUrl=${encodeURIComponent(urlToUse)}`)
      console.log('API Response:', response.data)
      console.log('Recent Videos:', response.data.recentVideos)
      setData(response.data)
      if (response.data.hasChannel) {
        setShowInput(false)
      }
    } catch (error) {
      console.error('Error fetching streak:', error)
      alert('Failed to fetch channel data. Please check your URL.')
    }
    setLoading(false)
  }

  if (showInput || !data?.hasChannel) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">📈 Upload Streak Tracker</h1>
          <p className="text-gray-600">Enter your YouTube channel URL to analyze your upload pattern</p>
        </div>

        <div className="bg-white border rounded-lg p-8 shadow-lg">
          <h2 className="text-xl font-bold mb-4">Enter Your YouTube Channel URL</h2>
          <p className="text-sm text-gray-600 mb-4">Examples:</p>
          <ul className="text-xs text-gray-500 mb-6 space-y-1">
            <li>• https://www.youtube.com/@YourChannelName</li>
            <li>• https://www.youtube.com/channel/UCxxxxxxxxxxxxx</li>
            <li>• https://www.youtube.com/c/YourChannelName</li>
          </ul>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="Paste your YouTube channel URL here..."
              className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              value={channelUrl}
              onChange={(e) => setChannelUrl(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchStreakData()}
            />
            <button
              onClick={() => fetchStreakData()}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg font-semibold hover:scale-105 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Analyzing...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Analyze
                </>
              )}
            </button>
          </div>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>How to find your channel URL:</strong>
            </p>
            <ol className="text-xs text-blue-700 mt-2 space-y-1 ml-4">
              <li>1. Go to YouTube.com and sign in</li>
              <li>2. Click on your profile icon (top right)</li>
              <li>3. Click "Your channel"</li>
              <li>4. Copy the URL from your browser's address bar</li>
            </ol>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">📊 Upload Streak Tracker</h1>
        <p className="text-gray-600">Track your upload consistency and get AI-powered recommendations</p>
      </div>

      {/* Channel Info */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">{data.channelTitle}</h2>
            <p className="text-white/90">Total Videos: {data.totalVideos}</p>
          </div>
          <button
            onClick={() => { setShowInput(true); setData(null); setChannelUrl(''); }}
            className="px-4 py-2 bg-white text-red-500 rounded-lg font-semibold hover:scale-105 transition-all"
          >
            Change Channel
          </button>
        </div>
      </div>

      {/* Algorithm Score */}
      <div className="bg-white border rounded-lg p-6 mb-6 shadow-lg">
        <h3 className="text-lg font-semibold mb-3">YouTube Algorithm Score</h3>
        <div className="flex items-center gap-4">
          <div className="relative w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle cx="64" cy="64" r="56" stroke="#e5e7eb" strokeWidth="12" fill="none" />
              <circle 
                cx="64" 
                cy="64" 
                r="56" 
                stroke={data.algorithmScore >= 70 ? '#22c55e' : data.algorithmScore >= 40 ? '#f59e0b' : '#ef4444'}
                strokeWidth="12" 
                fill="none"
                strokeDasharray={`${(data.algorithmScore / 100) * 351.86} 351.86`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold">{data.algorithmScore}</span>
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 mb-2">Based on YouTube's recommendation algorithm:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>✓ Upload Frequency: {data.stats.uploadFrequency} videos/day</li>
              <li>✓ Consistency: {data.stats.consistency}%</li>
              <li>✓ Avg Gap: {data.stats.avgGapBetweenUploads} days</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-yellow-500" size={20} />
            <h3 className="font-semibold text-gray-700">Current Streak</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.currentStreak} days</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Video className="text-blue-500" size={20} />
            <h3 className="font-semibold text-gray-700">Last 7 Days</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.last7Days} videos</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-500" size={20} />
            <h3 className="font-semibold text-gray-700">Last 30 Days</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.last30Days} videos</p>
        </div>

        <div className="bg-white border rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-purple-500" size={20} />
            <h3 className="font-semibold text-gray-700">Days Since Last</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{data.stats.daysSinceLastUpload} days</p>
        </div>
      </div>

      {/* View Prediction - Shorts vs Regular */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-pink-50 to-red-50 border border-pink-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-pink-900 mb-3">📱 If You Upload Shorts</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Predicted Views:</span>
              <span className="text-2xl font-bold text-pink-900">
                {data.viewPrediction.shorts.min.toLocaleString()} - {data.viewPrediction.shorts.max.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Chance:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                data.viewPrediction.shorts.chance === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.viewPrediction.shorts.chance}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-3">Avg: {data.viewPrediction.shorts.avg.toLocaleString()} views</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-3">🎥 If You Upload Regular Video</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Predicted Views:</span>
              <span className="text-2xl font-bold text-blue-900">
                {data.viewPrediction.regular.min.toLocaleString()} - {data.viewPrediction.regular.max.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Success Chance:</span>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                data.viewPrediction.regular.chance === 'High' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {data.viewPrediction.regular.chance}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-3">Avg: {data.viewPrediction.regular.avg.toLocaleString()} views</p>
          </div>
        </div>
      </div>

      {/* Optimal Upload Schedule */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h3 className="text-xl font-bold mb-3">📅 Optimal Upload Schedule (Next 3 Videos)</h3>
        <p className="text-sm text-gray-600 mb-4">{data.optimalSchedule.strategy}</p>
        <div className="space-y-3">
          {data.optimalSchedule.schedule.map((item: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-4">
                <div className="bg-green-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">
                  {item.videoNumber}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{item.date}</p>
                  <p className="text-xs text-gray-500">{item.reason}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">In {item.daysFromNow} days</p>
                <p className="text-xs text-gray-500">Upload by this date</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            💡 <strong>Pro Tip:</strong> Upload every {data.optimalSchedule.optimalGap} day(s) to maximize views and maintain algorithm favor.
          </p>
        </div>
      </div>

      {/* AI Recommendation */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-purple-900">🤖 AI-Powered Recommendation</h3>
          <span className={`px-4 py-2 rounded-full font-semibold ${
            data.impact?.toLowerCase().includes('boost') ? 'bg-green-100 text-green-800' :
            data.impact?.toLowerCase().includes('risk') ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {data.impact || 'Analyzing...'}
          </span>
        </div>
        <p className="text-lg text-purple-800 mb-4">{data.recommendation}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Recommended Video Type:</p>
            <p className="text-2xl font-bold text-purple-900">{data.nextVideoType}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <p className="text-sm text-gray-600 mb-1">Expected Views:</p>
            <p className="text-2xl font-bold text-purple-900">{data.aiViewPrediction}</p>
          </div>
        </div>
        
        {/* Detailed AI Analysis */}
        <details className="mt-4">
          <summary className="cursor-pointer text-sm text-purple-700 font-medium hover:text-purple-900">
            🔍 View Detailed AI Analysis ▼
          </summary>
          <div className="mt-3 p-4 bg-white rounded-lg border border-purple-100">
            <pre className="text-xs text-gray-700 whitespace-pre-wrap">{data.aiAnalysis}</pre>
          </div>
        </details>
      </div>

      {/* Recent Videos */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="text-xl font-bold mb-4">Recent Uploads</h3>
        {data.recentVideos && data.recentVideos.length > 0 ? (
          <div className="space-y-3">
            {data.recentVideos.map((video: any, index: number) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all">
                {video.thumbnail ? (
                  <img 
                    src={video.thumbnail} 
                    alt={video.title || 'Video thumbnail'} 
                    className="w-32 h-20 object-cover rounded"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/120x90?text=No+Image';
                    }}
                  />
                ) : (
                  <div className="w-32 h-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                    No Image
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 line-clamp-2">{video.title || 'Untitled Video'}</h4>
                  <p className="text-sm text-gray-500">
                    {video.publishedAt ? new Date(video.publishedAt).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    }) : 'Unknown date'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent videos found</p>
        )}
      </div>
    </div>
  )
}

export default UploadStreakPage
