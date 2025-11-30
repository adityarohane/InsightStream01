import React from "react";
import { VideoInfo } from "../page"; // ✅ import VideoInfo from page.tsx

type Props = {
  videoInfo: VideoInfo;
  onClick?: (thumbnailUrl: string) => void;
};

function VideoCard({ videoInfo, onClick }: Props) {
  return (
    <div
      className="rounded-lg shadow-md bg-white hover:shadow-xl transition-all p-3 cursor-pointer transform hover:-translate-y-1 hover:scale-105"
      onClick={() => onClick && onClick(videoInfo.thumbnail)}
    >
      <img
        src={videoInfo.thumbnail}
        alt={videoInfo.title}
        className="rounded-md w-full object-cover"
      />
      <div className="mt-3">
        <h3 className="font-semibold text-lg line-clamp-2">{videoInfo.title}</h3>
        <p className="text-sm text-gray-500">{videoInfo.channelTitle}</p>
        <p className="text-xs text-gray-400">
          {new Date(videoInfo.publishedAt).toDateString()}
        </p>
        <div className="flex gap-4 mt-2 text-sm text-gray-600">
          <span>👀 {videoInfo.viewCount}</span>
          <span>👍 {videoInfo.likeCount || 0}</span>
        </div>
      </div>
    </div>
  );
}

export default VideoCard;
