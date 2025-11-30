"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import { Loader2, Search } from "lucide-react";
import React, { useState } from "react";
import ThumbnailSearchList from "./_components/ThumbnailSearchList";

// 🔹 Define type for video info
export type VideoInfo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  likeCount?: string;
  commentCount?: string;
};

const ThumbnailSearchPage = () => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoList, setVideoList] = useState<VideoInfo[]>([]);

  // Search by text query
  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      setLoading(true);
      const result = await axios.get("/api/thumbnail-search?query=" + encodeURIComponent(query));
      console.log(result.data);
      setVideoList(result.data || []); // expects an array
    } catch (error: any) {
      console.error("Error fetching search results:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Search similar videos by thumbnail click
  const SearchSimilarThumbnail = async (thumbnailUrl: string) => {
    try {
      setLoading(true);
      const result = await axios.get("/api/thumbnail-search?thumbnailUrl=" + encodeURIComponent(thumbnailUrl));
      console.log(result.data);
      setVideoList(result.data || []); // expects array of VideoInfo
    } catch (error: any) {
      console.error("Error searching similar thumbnail:", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-20 lg:px-40">
      {/* Header Section */}
      <div className="flex flex-col items-center text-center mt-20 gap-4">
        <h2 className="font-bold text-4xl">
          AI Thumbnail Search: Find the Perfect Match Instantly!
        </h2>
        <p className="text-gray-400 max-w-2xl">
          Turn any video into a high-impact, attention-grabbing thumbnail in
          seconds! Our AI-powered YouTube thumbnail generator creates
          professional, eye-catching designs instantly—no design skills needed,
          just more clicks and views.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mt-8 p-2 border rounded-xl flex items-center gap-2 bg-secondary">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Enter any value to search"
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
              <Search className="h-4 w-4" /> Search
            </>
          )}
        </Button>
      </div>

      {/* Results Section */}
      <div className="mt-10">
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-3 shadow-md animate-pulse">
                <Skeleton className="h-40 w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4 mt-3" />
                <Skeleton className="h-3 w-1/2 mt-2" />
                <Skeleton className="h-3 w-1/3 mt-2" />
              </div>
            ))}
          </div>
        ) : (
          <ThumbnailSearchList
            videoList={videoList}
            SearchSimilarThumbnail={SearchSimilarThumbnail}
          />
        )}
      </div>
    </div>
  );
};

export default ThumbnailSearchPage;
