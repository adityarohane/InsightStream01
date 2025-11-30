import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextGeminiKey } from "@/lib/gemini-rotation";

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    // Step 1: Get YouTube trending keywords using YouTube API
    const youtubeKeywords = await getYouTubeTrendingKeywords(topic);

    // Step 2: Use AI with key rotation
    const apiKey = getNextGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Analyze this topic: "${topic}"

Based on these YouTube search trends: ${youtubeKeywords.join(", ")}

Generate a comprehensive keyword research report in JSON format:
{
  "primary_keywords": [
    {"keyword": "main keyword 1", "search_volume": "high/medium/low", "competition": "high/medium/low", "relevance_score": 95}
  ],
  "long_tail_keywords": [
    {"keyword": "specific long tail keyword", "search_volume": "medium", "competition": "low", "relevance_score": 90}
  ],
  "trending_keywords": [
    {"keyword": "trending keyword", "trend": "rising/stable", "relevance_score": 85}
  ],
  "related_topics": ["topic1", "topic2", "topic3"],
  "content_suggestions": ["suggestion 1", "suggestion 2"]
}

Provide 5-7 keywords in each category. Focus on YouTube SEO.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const keywordData = jsonMatch ? JSON.parse(jsonMatch[0]) : {
      primary_keywords: [{ keyword: topic, search_volume: "medium", competition: "medium", relevance_score: 80 }],
      long_tail_keywords: [],
      trending_keywords: [],
      related_topics: [],
      content_suggestions: []
    };

    return NextResponse.json({
      success: true,
      data: keywordData,
      topic
    });
  } catch (error) {
    console.error("Keyword research error:", error);
    return NextResponse.json({ error: "Failed to generate keyword research" }, { status: 500 });
  }
}

async function getYouTubeTrendingKeywords(topic: string): Promise<string[]> {
  try {
    if (!process.env.YOUTUBE_API_KEY) {
      return [topic];
    }

    // Search YouTube for related videos
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(topic)}&type=video&maxResults=10&order=viewCount&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (!response.ok) {
      return [topic];
    }

    const data = await response.json();
    const keywords: string[] = [];

    // Extract keywords from video titles and tags
    data.items?.forEach((item: any) => {
      const title = item.snippet.title;
      keywords.push(title);
    });

    return keywords.slice(0, 10);
  } catch (error) {
    console.error("YouTube API error:", error);
    return [topic];
  }
}
