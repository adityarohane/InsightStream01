import { NextRequest, NextResponse } from "next/server";
import { db } from "@/configs/db";
import { usersTable, AiThumbnailTable, AiContentTable } from "@/configs/schema";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Total users
    const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(usersTable);
    
    // Total thumbnails generated
    const totalThumbnails = await db.select({ count: sql<number>`count(*)` }).from(AiThumbnailTable);
    
    // Total content generated
    const totalContent = await db.select({ count: sql<number>`count(*)` }).from(AiContentTable);
    
    // Most active users (by thumbnail generation)
    const activeUsers = await db
      .select({
        email: AiThumbnailTable.userEmail,
        count: sql<number>`count(*)`
      })
      .from(AiThumbnailTable)
      .groupBy(AiThumbnailTable.userEmail)
      .orderBy(sql`count(*) desc`)
      .limit(10);

    // Recent users
    const recentUsers = await db
      .select()
      .from(usersTable)
      .orderBy(sql`${usersTable.id} desc`)
      .limit(10);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers: totalUsers[0]?.count || 0,
        totalThumbnails: totalThumbnails[0]?.count || 0,
        totalContent: totalContent[0]?.count || 0,
        activeUsers,
        recentUsers
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
