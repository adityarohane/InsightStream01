// configs/functions.ts
import { inngest } from "./client";
import { db } from "@/configs/db";
import { AiThumbnailTable, AiContentTable } from "@/configs/schema";
import axios from "axios";
import ImageKit from "imagekit";

// -------------------------
// ImageKit Setup
// -------------------------
const imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
});

// -------------------------
// Generate Thumbnail Function
// -------------------------
export const GenerateAiThumbnail = inngest.createFunction(
  { id: "ai/generateThumbnail" },
  { event: "ai/generateThumbnail" },
  async ({ event, step }) => {
    const { userInput, refImage, userEmail } = event.data;

    // ✅ Upload reference image (if provided)
    const refImageUrl = refImage
      ? await step.run("upload-ref", async () => {
          const filePayload =
            typeof refImage.buffer === "string"
              ? `data:${refImage.type};base64,${refImage.buffer}`
              : refImage.buffer ?? "";

          const resp = await imageKit.upload({
            file: filePayload,
            fileName: `${Date.now()}-${refImage.name}`,
            isPublished: true,
            useUniqueFileName: false,
          });

          return resp.url;
        })
      : null;

    // ✅ Generate thumbnail prompt
    const thumbnailPrompt = await step.run("generate-thumbnail-prompt", async () => {
      const promptText = refImageUrl
        ? `Refer to this thumbnail: ${refImageUrl}. Generate a professional YouTube thumbnail prompt (1280x720, 16:9) for: ${userInput}.`
        : `Generate a professional YouTube thumbnail prompt (1280x720, 16:9) for: ${userInput}.`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-exp:free",
          messages: [{ role: "user", content: promptText }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.choices?.[0]?.message?.content ?? "";
    });

    // ✅ Generate thumbnail image using HuggingFace
    const thumbnailUrl = await step.run("generate-thumbnail-image", async () => {
      const hfResp = await axios.post(
        "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0",
        { inputs: thumbnailPrompt },
        {
          headers: { Authorization: `Bearer ${process.env.HF_API_TOKEN}` },
          responseType: "arraybuffer",
        }
      );

      const buffer = Buffer.from(hfResp.data);

      const uploaded = await imageKit.upload({
        file: buffer,
        fileName: `generated-thumbnail-${Date.now()}.png`,
        isPublished: true,
        useUniqueFileName: true,
      });

      return uploaded.url;
    });

    // ✅ Save thumbnail record in DB
    await step.run("save-thumbnail-db", async () => {
      await db.insert(AiThumbnailTable).values({
        userInput,
        refImage: refImageUrl,
        userEmail,
        thumbnailUrl,
        createdOn: new Date().toISOString(),
      });
    });

    return {
      success: true,
      thumbnailPrompt,
      thumbnailUrl,
    };
  }
);

// -------------------------
// Generate AI Content Function
// -------------------------
export const GenerateAIContent = inngest.createFunction(
  { id: "ai/generateContent" },
  { event: "ai/generateContent" },
  async ({ event, step }) => {
    const { userInput, userEmail, refImage } = event.data;

    // ✅ Upload reference image (if provided)
    const refImageUrl = refImage
      ? await step.run("upload-ref", async () => {
          const filePayload =
            typeof refImage.buffer === "string"
              ? `data:${refImage.type};base64,${refImage.buffer}`
              : refImage.buffer ?? "";

          const resp = await imageKit.upload({
            file: filePayload,
            fileName: `${Date.now()}-${refImage.name}`,
            isPublished: true,
            useUniqueFileName: false,
          });

          return resp.url;
        })
      : null;

    // ✅ Generate AI content (titles, description, tags)
    const aiContent = await step.run("generate-ai-content", async () => {
      const systemPrompt = `You are an expert YouTube SEO strategist. Based on the user input: "${userInput}", generate JSON only:
{
  "titles": [
    {"title":"Title 1", "seo_score": 90},
    {"title":"Title 2", "seo_score": 85},
    {"title":"Title 3", "seo_score": 80}
  ],
  "description": "A professional YouTube description here.",
  "tags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7","tag8","tag9","tag10"]
}`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.0-flash-exp:free",
          messages: [{ role: "user", content: systemPrompt }],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const rawJson = response.data.choices?.[0]?.message?.content ?? "";
      const formattedJsonString = rawJson
        ?.replace("```json", "")
        .replace("```", "")
        .trim();

      return formattedJsonString ? JSON.parse(formattedJsonString) : null;
    });

    // ✅ Save AI content to DB
    await step.run("save-ai-content-db", async () => {
      await db.insert(AiContentTable).values({
        userInput,
        content: aiContent,
        thumbnailUrl: null,
        userEmail,
        createdOn: new Date().toISOString(),
      });
    });

    return {
      success: true,
      email: userEmail,
      aiContent,
    };
  }
);

// -------------------------
// Get Trending Keywords Function
// -------------------------
export const GetTrendingKeywords = inngest.createFunction(
  { id: "ai/trending-keywords" },
  { event: "ai/trending-keywords" },
  async ({ event, step }) => {
    const { userInput, userEmail } = event.data;

    // ✅ Get Google Search results with BrightData
    const resp = await axios.post(
      "https://api.brightdata.com/request",
      {
        zone: "serp_api1",
        url: `https://www.google.com/search?q=${encodeURIComponent(userInput)}&brd_json=1`,
        format: "json",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.BRIGHTDATA_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = resp.data;

    // TODO: YouTube search + AI-generated keyword extraction can go here
    // TODO: Optionally save to DB

    return {
      success: true,
      userInput,
      userEmail,
      googleResults: data,
    };
  }
);
