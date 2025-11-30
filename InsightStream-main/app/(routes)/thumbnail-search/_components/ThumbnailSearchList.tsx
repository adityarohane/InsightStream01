import React from "react";
import { VideoInfo } from "../page";
import VideoCard from "./VideoCard";

type Props = {
  videoList: VideoInfo[] | undefined;
  SearchSimilarThumbnail: (url: string) => void;
};

function ThumbnailSearchList({ videoList, SearchSimilarThumbnail }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {videoList?.map((video, index) => (
        <VideoCard
          key={index}
          videoInfo={video}
          onClick={SearchSimilarThumbnail}
        />
      ))}
    </div>
  );
}

export default ThumbnailSearchList;
