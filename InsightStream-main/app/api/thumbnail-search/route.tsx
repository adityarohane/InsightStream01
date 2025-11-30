import axios from "axios";
import { openai } from "inngest";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("query");
  const thumbnailUrl = searchParams.get("thumbnailUrl");

  // Step 1: Generate tags if thumbnailUrl is provided
  if (thumbnailUrl) {
    try {
      //@ts-ignore
      const completion = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-exp:free",
        messages: [
          {
            role: "user",
            content: `Describe this thumbnail in short keywords suitable for searching similar YouTube videos.
Give me tags comma-separated. Do not give any comment text. Maximum 5 tags.
Make sure after searching that tags will get similar YouTube thumbnails. Thumbnail URL: ${thumbnailUrl}`,
          },
        ],
        max_tokens: 50,
      });

      const tags = completion.choices?.[0]?.message?.content?.trim() || "";
      return NextResponse.json({ tags });
    } catch (error: any) {
      return NextResponse.json(
        { error: "Failed to generate tags", details: error.message },
        { status: 500 }
      );
    }
  }

  // Step 2: Query YouTube if query parameter is provided
  if (!query) {
    return NextResponse.json(
      { error: "Query parameter is required" },
      { status: 400 }
    );
  }

  try {
    // Get video IDs from Search API
    const searchResult = await axios.get(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(
        query
      )}&type=video&maxResults=20&key=${process.env.YOUTUBE_API_KEY}`
    );

    const videoIds = searchResult.data.items
      .map((item: any) => item.id.videoId)
      .filter(Boolean)
      .join(",");

    if (!videoIds) {
      return NextResponse.json({ error: "No videos found" }, { status: 404 });
    }

    // Get video details by IDs
    const videoResult = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
    );

    // Format final response
    const finalResult = videoResult.data.items.map((item: any) => ({
      id: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      viewCount: item.statistics?.viewCount || 0,
      likeCount: item.statistics?.likeCount || 0,
      commentCount: item.statistics?.commentCount || 0,
    }));

    return NextResponse.json(finalResult);
  } catch (error: any) {
    return NextResponse.json(
      { error: "Failed to fetch YouTube results", details: error.message },
      { status: 500 }
    );
  }
}
