import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { GenerateAIContent, GenerateAiThumbnail, GetTrendingKeywords } from "../../../inngest/functions";

// Export GET, POST, PUT handlers for Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    GenerateAiThumbnail,
    GenerateAIContent,
    GetTrendingKeywords // ✅ make sure spelling matches exactly the export in functions.ts
  ],
});
