'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Edit3, TrendingUp, BarChart3 } from 'lucide-react';

function TrendingKeywords() {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [keywords, setKeywords] = useState<any[]>([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);

    try {
      const response = await fetch('/api/ai-trending-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche: prompt }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setKeywords(data.keywords || []);
    } catch (error) {
      console.error('Error generating trending keywords:', error);
      alert('Failed to generate keywords');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-20 lg:px-40">
      {/* Header */}
      <div className="flex flex-col items-center text-center mt-20 gap-4">
        <h2 className="font-bold text-4xl">Trending Hashtags Generator</h2>
        <p className="text-gray-400 max-w-2xl">
          Generate trending YouTube hashtags to increase your video reach and engagement.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto mt-8 p-2 border rounded-xl flex items-center gap-2 bg-secondary">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your topic or keyword"
          className="w-full p-2 outline-none bg-transparent"
        />
        <Button
          onClick={handleGenerate}
          disabled={loading}
          className="flex gap-2 items-center px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transition-all shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4" /> Generate
            </>
          )}
        </Button>
      </div>

      {/* Keywords Display */}
      {keywords.length > 0 && (
        <div className="max-w-4xl mx-auto mt-10">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <TrendingUp className="text-green-500" />
            Trending Hashtags
          </h3>
          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
            {keywords.map((kw, idx) => (
              <div 
                key={idx} 
                className="bg-secondary p-4 rounded-xl hover:scale-105 transition-all cursor-pointer"
                onClick={() => {
                  navigator.clipboard.writeText(kw.tag || kw.keyword);
                  alert('Copied to clipboard!');
                }}
              >
                <div className="text-center">
                  <h4 className="font-bold text-xl mb-3 text-blue-500">{kw.tag || kw.keyword}</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full">
                      {kw.usage || kw.search_volume}
                    </div>
                    <div className="bg-purple-500/20 text-purple-500 px-3 py-1 rounded-full">
                      {kw.engagement || kw.competition}
                    </div>
                    <div className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full">
                      {kw.trend}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-gray-400 mt-6 text-sm">Click on any hashtag to copy it</p>
        </div>
      )}
    </div>
  );
}

export default TrendingKeywords;
