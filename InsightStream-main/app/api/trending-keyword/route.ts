import { inngest } from "@/inngest/client";
import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { userInput } = await req.json();
    const user = await currentUser();

    const result = await inngest.send({
      name: "ai/trending-keywords",
      data: {
        userInput,
        userEmail: user?.primaryEmailAddress?.emailAddress,
      },
    });

    return NextResponse.json({ runId: result.ids[0] });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
