import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

// Type for raw preprocessing step
type RawVideo = {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  viewsPerDay: number;
  engagementRate: number;
};

// Type for final output with SmartScore + Outlier info
type VideoData = RawVideo & {
  smartScore: number;
  isOutlier: boolean;
  outlierScore?: number;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { error: "Query parameter is required" },
        { status: 400 }
      );
    }

    // Step 1: Search videos
    const searchResult = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`
    );

    const videoIds: string = searchResult.data.items
      .map((item: any) => item.id.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) {
      return NextResponse.json({ error: "No videos found" }, { status: 404 });
    }

    // Step 2: Fetch video statistics
    const videoResult = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
    );

    const today = new Date();

    // Step 3: Preprocess videos (raw metrics)
    const rawVideos: RawVideo[] = videoResult.data.items.map((item: any) => {
      const viewCount = parseInt(item.statistics.viewCount || "0");
      const likeCount = parseInt(item.statistics.likeCount || "0");
      const commentCount = parseInt(item.statistics.commentCount || "0");

      const publishedDate = new Date(item.snippet.publishedAt);
      const daysSincePublished = Math.max(
        (today.getTime() - publishedDate.getTime()) / (1000 * 60 * 60 * 24),
        1
      ); // prevent /0

      const viewsPerDay = viewCount / daysSincePublished;
      const engagementRate =
        (likeCount + commentCount) / Math.max(viewCount, 1);

      return {
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.high.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        viewCount,
        likeCount,
        commentCount,
        viewsPerDay,
        engagementRate,
      };
    });

    // Step 4: Calculate normalization values
    const avgViews =
      rawVideos.reduce((sum: number, v: RawVideo) => sum + v.viewCount, 0) /
      rawVideos.length;

    const maxViewsPerDay = Math.max(...rawVideos.map((v: RawVideo) => v.viewsPerDay));
    const maxEngagementRate = Math.max(...rawVideos.map((v: RawVideo) => v.engagementRate));

    // Step 5: Add SmartScore
    const videosWithScore: (RawVideo & { smartScore: number })[] = rawVideos.map(
      (v: RawVideo) => {
        const smartScore =
          (v.viewCount / avgViews) * 0.5 +
          (v.viewsPerDay / Math.max(maxViewsPerDay, 1)) * 0.3 +
          (v.engagementRate / Math.max(maxEngagementRate, 1)) * 0.2;

        return {
          ...v,
          smartScore,
        };
      }
    );

    // Step 6: IQR Outlier detection on smartScore
    const scores: number[] = videosWithScore
      .map((v) => v.smartScore)
      .sort((a: number, b: number) => a - b);

    const q1 = scores[Math.floor(scores.length / 4)];
    const q3 = scores[Math.floor((scores.length * 3) / 4)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    // Step 7: Mark outliers
    const finalResult: VideoData[] = videosWithScore.map((v) => ({
      ...v,
      isOutlier: v.smartScore < lowerBound || v.smartScore > upperBound,
      outlierScore: v.smartScore > upperBound ? v.smartScore / upperBound : undefined,
    }));

    return NextResponse.json(finalResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch YouTube results", details: error.message },
      { status: 500 }
    );
  }
}
