import React from "react";
import { VideoInfoOutlier } from "../../outlier/page";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Props = {
  videoInfo: VideoInfoOutlier;
  onClick?: (thumbnailUrl: string) => void;
};

function VideoOutlierCard({ videoInfo, onClick }: Props) {
  return (
    <div
      className="relative rounded-lg shadow-md bg-white hover:shadow-xl transition-all p-3 cursor-pointer transform hover:-translate-y-1 hover:scale-105"
      onClick={() => onClick && onClick(videoInfo.thumbnail)}
    >
      {/* ✅ SmartScore Badge with Tooltip */}
      <Tooltip>
        <TooltipTrigger asChild>
          <h2 className="absolute right-3 top-3 px-2 py-1 bg-blue-500 text-white text-sm font-semibold rounded-sm">
            {videoInfo.smartScore.toFixed(2)}x
          </h2>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          className="bg-gray-900 text-white px-3 py-2 rounded-md shadow-lg"
        >
          <p>SmartScore: {videoInfo.smartScore.toFixed(2)}</p>
          {videoInfo.outlierScore !== undefined && (
            <p>Outlier Score: {videoInfo.outlierScore.toFixed(2)}</p>
          )}
        </TooltipContent>
      </Tooltip>

      {/* ✅ Thumbnail */}
      <img
        src={videoInfo.thumbnail}
        alt={videoInfo.title}
        className="rounded-md w-full object-cover"
      />

      {/* ✅ Video Info */}
      <div className="mt-3">
        <h3 className="font-semibold text-lg line-clamp-2">{videoInfo.title}</h3>
        <p className="text-sm text-gray-500">{videoInfo.channelTitle}</p>
        <p className="text-xs text-gray-400">
          {new Date(videoInfo.publishedAt).toDateString()}
        </p>

        {/* ✅ Metrics Layout */}
        <div className="flex justify-between items-center mt-2">
          {/* Views on left */}
          <span className="text-sm text-gray-600">
            👀 {videoInfo.viewCount.toLocaleString()}
          </span>

          {/* Engagement Rate with Tooltip */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-sm text-white bg-red-500 px-2 py-1 rounded-sm cursor-default">
                📊 {videoInfo.engagementRate.toFixed(2)}%
              </div>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-gray-900 text-white px-3 py-2 rounded-md shadow-lg"
            >
              <p>Engagement Rate: {videoInfo.engagementRate.toFixed(2)}%</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
}

export default VideoOutlierCard;
