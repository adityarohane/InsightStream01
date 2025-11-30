'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import axios from 'axios';
import VideoOutlierCard from '../thumbnail-search/_components/VideoOutlierCard';

// ✅ Correct type that matches your API
export type VideoInfoOutlier = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount?: number;
  commentCount?: number;
  smartScore: number;
  viewsPerDay: number;
  isOutlier: boolean;
  engagementRate: number;
  outlierScore?: number; // optional
};

function Outlier() {
  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // ✅ should be VideoInfoOutlier[], not VideoInfo[]
  const [videoList, setVideoList] = useState<VideoInfoOutlier[]>([]);

  const handleSearch = async () => {
    try {
      if (!userInput.trim()) return;
      setLoading(true);

      const result = await axios.get(`/api/outlier?query=${userInput}`);
      console.log(result.data);

      setVideoList(result.data);
    } catch (e) {
      console.error('Error fetching outliers:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-20 lg:px-40">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mt-20 gap-4">
        <h2 className="font-bold text-4xl">Outlier Detection</h2>
        <p className="text-gray-400 max-w-2xl">
          Outlier Detection Tool helps you quickly identify unusual or anomalous data points 
          in your dataset. Simply enter your values, and our AI-powered system will 
          highlight potential outliers, allowing for better insights, data quality checks, 
          and informed decision-making. No complex setup required—just accurate results instantly.
        </p>
      </div>

      {/* Input Section */}
      <div className="max-w-2xl mx-auto mt-8 p-2 border rounded-xl flex items-center gap-2 bg-secondary">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Enter search keyword"
          className="w-full p-2 outline-none bg-transparent"
        />
        <Button
          onClick={handleSearch}
          disabled={loading}
          className="flex gap-2 items-center px-5 py-2 rounded-lg 
                     bg-gradient-to-r from-blue-500 to-indigo-600 text-white 
                     hover:from-blue-600 hover:to-indigo-700 
                     transition-all shadow-md"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Loading...
            </>
          ) : (
            <>
              <Search className="h-4 w-4" /> Detect
            </>
          )}
        </Button>
      </div>

      {/* Results Section */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoList?.map((video, index) => (
          <div key={index}>
          <VideoOutlierCard key={video.id || index} videoInfo={video} />
          </div>
         ))}
      </div>
    </div>
  );
}

export default Outlier;
