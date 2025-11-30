// app/api/generate-thumbnail/route.tsx
import { db } from "@/configs/db";
import { AiThumbnailTable } from "@/configs/schema";
import { inngest } from "@/inngest/client";
import { currentUser } from "@clerk/nextjs/server";
import { desc, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const userInput = formData.get("userInput") as string;
    const refImage = formData.get("refImage") as File | null;
    const user = await currentUser();

    let imageBlob: Blob;

    // If reference image uploaded, use FLUX image-to-image
    if (refImage && process.env.REPLICATE_API_TOKEN) {
      try {
        const Replicate = (await import('replicate')).default;
        const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

        const bytes = await refImage.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        const imageUrl = `data:${refImage.type};base64,${base64}`;

        const output = await replicate.run("black-forest-labs/flux-dev", {
          input: {
            prompt: `${userInput}, professional YouTube thumbnail, 16:9 aspect ratio, eye-catching, bold colors, dramatic lighting, vibrant design`,
            image: imageUrl,
            prompt_strength: 0.4,
            num_outputs: 1,
            aspect_ratio: "16:9",
            output_format: "png",
            output_quality: 100,
          }
        }) as string[];

        if (output?.[0]) {
          const response = await fetch(output[0]);
          imageBlob = await response.blob();
        } else {
          throw new Error('FLUX failed');
        }
      } catch (error) {
        console.error('Image-to-image failed:', error);
        throw new Error('Failed to generate with reference image');
      }
    } else {
      // Text-to-image
      let prompt = `Professional YouTube thumbnail: ${userInput}. Bold text overlay, vibrant colors, high contrast, eye-catching design, dramatic lighting, 16:9 aspect ratio`;

      if (process.env.REPLICATE_API_TOKEN) {
        try {
          const Replicate = (await import('replicate')).default;
          const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });

          const output = await replicate.run("black-forest-labs/flux-dev", {
            input: {
              prompt: prompt,
              num_outputs: 1,
              aspect_ratio: "16:9",
              output_format: "png",
              output_quality: 100,
            }
          }) as string[];

          if (output?.[0]) {
            const response = await fetch(output[0]);
            imageBlob = await response.blob();
          } else {
            throw new Error('Replicate failed');
          }
        } catch (replicateError) {
          const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&model=flux&enhance=true&nologo=true`;
          const response = await fetch(pollinationsUrl);
          imageBlob = await response.blob();
        }
      } else {
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&model=flux&enhance=true&nologo=true`;
        const response = await fetch(pollinationsUrl);
        imageBlob = await response.blob();
      }
    }

    const buffer = Buffer.from(await imageBlob.arrayBuffer());

    const uploadResponse = await imagekit.upload({
      file: buffer.toString("base64"),
      fileName: `thumbnail_${Date.now()}.png`,
      folder: "/thumbnails",
    });

    const thumbnailUrl = uploadResponse.url;

    await db.insert(AiThumbnailTable).values({
      userInput,
      thumbnailUrl,
      userEmail: user?.primaryEmailAddress?.emailAddress || "",
    });

    return NextResponse.json({ success: true, thumbnailUrl });
  } catch (error) {
    console.error("Error in /api/generate-thumbnail:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate thumbnail" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const user = await currentUser();
  const result = await db
    .select()
    .from(AiThumbnailTable)
    .where(eq(AiThumbnailTable.userEmail, user?.primaryEmailAddress?.emailAddress!))
    .orderBy(desc(AiThumbnailTable.id));

  return NextResponse.json(result);
}
