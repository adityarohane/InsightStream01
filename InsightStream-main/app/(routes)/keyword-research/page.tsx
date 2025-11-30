"use client"
import { ArrowUp, Loader2, Search, TrendingUp } from 'lucide-react'
import React, { useState } from 'react'
import axios from 'axios'

function KeywordResearchPage() {
  const [topic, setTopic] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [keywordData, setKeywordData] = useState<any>(null)

  const handleSearch = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/keyword-research', { topic })
      setKeywordData(response.data.data)
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to generate keyword research')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center text-center justify-center mt-10 flex-col gap-2">
        <h2 className="font-bold text-4xl">AI Keyword Research</h2>
        <p className="text-gray-400 text-center max-w-2xl">
          Discover trending keywords for your YouTube videos. Get AI-powered keyword suggestions based on real YouTube data.
        </p>
      </div>

      {/* Search Input */}
      <div className="flex gap-5 items-center p-3 border rounded-xl mt-10 max-w-3xl mx-auto">
        <Search className="text-gray-400" />
        <input
          placeholder="Enter your video topic (e.g., 'how to learn coding')"
          className="w-full outline-0 bg-transparent"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <div 
          className="p-3 bg-gradient-to-t from-red-500 to-orange-500 rounded-full cursor-pointer" 
          onClick={handleSearch}
        >
          {loading ? <Loader2 className="animate-spin" /> : <ArrowUp />}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="mt-10 flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
          <p className="text-gray-400">Analyzing YouTube trends and generating keywords...</p>
        </div>
      )}

      {/* Results */}
      {keywordData && !loading && (
        <div className="mt-10 max-w-6xl mx-auto space-y-6">
          {/* Primary Keywords */}
          <div className="bg-secondary p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-red-500" />
              Primary Keywords
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {keywordData.primary_keywords?.map((kw: any, idx: number) => (
                <div key={idx} className="bg-background p-4 rounded-lg">
                  <p className="font-semibold">{kw.keyword}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span>Volume: {kw.search_volume}</span>
                    <span>Competition: {kw.competition}</span>
                    <span>Score: {kw.relevance_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Long Tail Keywords */}
          <div className="bg-secondary p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Long-Tail Keywords</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {keywordData.long_tail_keywords?.map((kw: any, idx: number) => (
                <div key={idx} className="bg-background p-4 rounded-lg">
                  <p className="font-semibold">{kw.keyword}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span>Volume: {kw.search_volume}</span>
                    <span>Competition: {kw.competition}</span>
                    <span>Score: {kw.relevance_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Keywords */}
          <div className="bg-secondary p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Trending Keywords</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {keywordData.trending_keywords?.map((kw: any, idx: number) => (
                <div key={idx} className="bg-background p-4 rounded-lg">
                  <p className="font-semibold">{kw.keyword}</p>
                  <div className="flex gap-4 mt-2 text-sm text-gray-400">
                    <span>Trend: {kw.trend}</span>
                    <span>Score: {kw.relevance_score}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Related Topics */}
          <div className="bg-secondary p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Related Topics</h3>
            <div className="flex flex-wrap gap-3">
              {keywordData.related_topics?.map((topic: string, idx: number) => (
                <span key={idx} className="bg-background px-4 py-2 rounded-full text-sm">
                  {topic}
                </span>
              ))}
            </div>
          </div>

          {/* Content Suggestions */}
          <div className="bg-secondary p-6 rounded-xl">
            <h3 className="text-xl font-bold mb-4">Content Suggestions</h3>
            <ul className="space-y-2">
              {keywordData.content_suggestions?.map((suggestion: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-red-500">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}

export default KeywordResearchPage
