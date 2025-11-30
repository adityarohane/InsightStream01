import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextGeminiKey } from "@/lib/gemini-rotation";

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json();

    const apiKey = getNextGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `Generate 3 COMPLETELY DIFFERENT YouTube video concepts for: "${userInput}"

Each concept must have:
- UNIQUE title (different angle/hook)
- UNIQUE description (different story/approach)
- Relevant tags

JSON format:
{
  "content": [
    {
      "title": "First unique title",
      "seo_score": 95,
      "description": "First unique description with hook, story, and CTA",
      "tags": ["tag1", "tag2", "tag3"]
    },
    {
      "title": "Second completely different title",
      "seo_score": 90,
      "description": "Second unique description with different angle",
      "tags": ["tag4", "tag5", "tag6"]
    },
    {
      "title": "Third unique title with new perspective",
      "seo_score": 85,
      "description": "Third unique description with fresh approach",
      "tags": ["tag7", "tag8", "tag9"]
    }
  ]
}

Make each concept COMPLETELY DIFFERENT!`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let text = response.text();

    // Clean markdown and special characters
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let aiContent;
    
    try {
      if (jsonMatch) {
        const cleanJson = jsonMatch[0]
          .replace(/\n/g, ' ')
          .replace(/\r/g, '')
          .replace(/\t/g, ' ');
        const parsed = JSON.parse(cleanJson);
        
        // Transform to expected format
        aiContent = {
          titles: parsed.content?.map((item: any) => ({
            title: item.title,
            seo_score: item.seo_score
          })) || [],
          description: parsed.content?.[0]?.description || '',
          tags: parsed.content?.[0]?.tags || [],
          subContent: parsed.content || []
        };
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      aiContent = {
        titles: [
          {title: `${userInput} - Complete Guide`, seo_score: 85}
        ],
        description: `Learn ${userInput} in this guide!`,
        tags: userInput.toLowerCase().split(' ').slice(0, 5),
        subContent: [
          {
            title: `${userInput} - Complete Guide`,
            seo_score: 85,
            description: `Learn ${userInput} in this guide!`,
            tags: userInput.toLowerCase().split(' ').slice(0, 5)
          }
        ]
      };
    }

    return NextResponse.json({
      success: true,
      aiContent,
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Failed to generate AI content" }, { status: 500 });
  }
}
