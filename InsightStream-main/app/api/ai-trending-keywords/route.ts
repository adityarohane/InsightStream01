import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextGeminiKey } from "@/lib/gemini-rotation";

export async function POST(req: NextRequest) {
  try {
    const { niche } = await req.json();

    // Step 1: Get real YouTube trending videos
    const youtubeData = await fetchYouTubeTrendingData(niche);

    // Step 2: Extract hashtags from real videos
    const realHashtags = extractHashtagsFromVideos(youtubeData);

    // Step 3: Use AI with key rotation
    const apiKey = getNextGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Based on these REAL YouTube video titles and tags from trending videos:
${youtubeData.map((v: any) => v.title).join('\n')}

Extracted hashtags: ${realHashtags.join(', ')}

Generate additional trending hashtags for "${niche}" in JSON format:
{
  "hashtags": [
    {"tag": "#HashtagName", "usage": "estimated usage", "engagement": "high/medium/low", "trend": "rising/stable"}
  ]
}

Provide 15-20 hashtags. Mix of popular and niche-specific.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const aiHashtags = jsonMatch ? JSON.parse(jsonMatch[0]).hashtags : [];

    // Combine real + AI hashtags
    const allHashtags = [...realHashtags.map(tag => ({
      tag,
      usage: "Real YouTube data",
      engagement: "high",
      trend: "trending"
    })), ...aiHashtags];

    return NextResponse.json({
      success: true,
      keywords: allHashtags.slice(0, 25)
    });
  } catch (error) {
    console.error("Trending keywords error:", error);
    return NextResponse.json({ error: "Failed to fetch trending keywords" }, { status: 500 });
  }
}

async function fetchYouTubeTrendingData(niche: string) {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return [];
    }

    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(niche)}&type=video&maxResults=20&order=viewCount&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.items?.map((item: any) => ({
      title: item.snippet.title,
      description: item.snippet.description
    })) || [];
  } catch (error) {
    return [];
  }
}

function extractHashtagsFromVideos(videos: any[]): string[] {
  const hashtags = new Set<string>();
  
  videos.forEach(video => {
    const text = `${video.title} ${video.description}`;
    const matches = text.match(/#[a-zA-Z0-9_]+/g);
    if (matches) {
      matches.forEach(tag => hashtags.add(tag));
    }
  });

  return Array.from(hashtags).slice(0, 10);
}
