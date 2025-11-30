import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getNextGeminiKey } from "@/lib/gemini-rotation";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    const userEmail = user?.primaryEmailAddress?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
    }

    // Get channel URL/ID from query params
    const { searchParams } = new URL(req.url);
    let channelId = searchParams.get('channelId');
    const channelUrl = searchParams.get('channelUrl');

    // Extract channel ID from URL if provided
    if (channelUrl && !channelId) {
      // Handle different YouTube URL formats
      // https://www.youtube.com/@username
      // https://www.youtube.com/channel/UCxxxxx
      // https://studio.youtube.com/channel/UCxxxxx
      // https://www.youtube.com/c/channelname
      
      if (channelUrl.includes('/channel/')) {
        // Direct channel ID from URL
        channelId = channelUrl.split('/channel/')[1]?.split('/')[0]?.split('?')[0];
        console.log('Extracted channel ID from URL:', channelId);
      } else if (channelUrl.includes('/@')) {
        const username = channelUrl.split('/@')[1]?.split('/')[0];
        if (username) {
          console.log('Fetching channel by handle:', username);
          
          // Use Channels API with forHandle parameter (more accurate)
          const handleResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=id,snippet&forHandle=${encodeURIComponent(username)}&key=${process.env.YOUTUBE_API_KEY}`
          );
          const handleData = await handleResponse.json();
          console.log('Handle API response:', JSON.stringify(handleData, null, 2));
          
          if (handleData.items?.[0]) {
            channelId = handleData.items[0].id;
            console.log('Found channel ID from handle:', channelId);
          } else {
            // Fallback to search API
            console.log('Handle API failed, trying search...');
            const searchResponse = await fetch(
              `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(username)}&key=${process.env.YOUTUBE_API_KEY}`
            );
            const searchData = await searchResponse.json();
            if (searchData.items?.[0]) {
              channelId = searchData.items[0].snippet.channelId;
              console.log('Found channel ID from search:', channelId);
            }
          }
        }
      } else if (channelUrl.includes('/c/')) {
        const customUrl = channelUrl.split('/c/')[1]?.split('/')[0];
        const searchResponse = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q=${encodeURIComponent(customUrl)}&key=${process.env.YOUTUBE_API_KEY}`
        );
        const searchData = await searchResponse.json();
        if (searchData.items?.[0]) {
          channelId = searchData.items[0].snippet.channelId;
        }
      }
    }

    console.log('Final channel ID to fetch:', channelId);

    if (!channelId) {
      return NextResponse.json({ 
        error: "Please provide your YouTube channel URL",
        hasChannel: false,
        needsInput: true
      });
    }

    // Get channel uploads playlist
    const channelResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&id=${channelId}&key=${process.env.YOUTUBE_API_KEY}`
    );
    const channelData = await channelResponse.json();
    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;
    const channelTitle = channelData.items[0].snippet.title;

    // Get recent uploads (last 50 videos) - sorted by date descending
    const uploadsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=50&order=date&key=${process.env.YOUTUBE_API_KEY}`
    );
    const uploadsData = await uploadsResponse.json();

    console.log('Uploads API response:', JSON.stringify(uploadsData.items?.slice(0, 2), null, 2));

    if (!uploadsData.items || uploadsData.items.length === 0) {
      return NextResponse.json({
        hasChannel: true,
        channelTitle,
        totalVideos: 0,
        streak: 0,
        message: "No videos uploaded yet"
      });
    }

    // Map and sort videos by publish date (newest first)
    const videos = uploadsData.items
      .map((item: any) => {
        const videoId = item.contentDetails?.videoId || item.snippet?.resourceId?.videoId;
        const publishedAt = new Date(item.snippet.publishedAt || item.contentDetails?.videoPublishedAt);
        
        return {
          videoId,
          title: item.snippet.title,
          publishedAt,
          thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
        };
      })
      .sort((a: any, b: any) => b.publishedAt.getTime() - a.publishedAt.getTime());

    console.log('First 3 videos after sorting:', videos.slice(0, 3).map((v: any) => ({
      title: v.title,
      date: v.publishedAt.toISOString()
    })));

    const now = new Date();
    const last7Days = videos.filter((v: any) => {
      const diff = now.getTime() - v.publishedAt.getTime();
      return diff <= 7 * 24 * 60 * 60 * 1000;
    }).length;

    const last14Days = videos.filter((v: any) => {
      const diff = now.getTime() - v.publishedAt.getTime();
      return diff <= 14 * 24 * 60 * 60 * 1000;
    }).length;

    const last30Days = videos.filter((v: any) => {
      const diff = now.getTime() - v.publishedAt.getTime();
      return diff <= 30 * 24 * 60 * 60 * 1000;
    }).length;

    let currentStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < videos.length; i++) {
      const videoDate = new Date(videos[i].publishedAt);
      videoDate.setHours(0, 0, 0, 0);
      
      const daysDiff = Math.floor((today.getTime() - videoDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === currentStreak) {
        currentStreak++;
      } else if (daysDiff > currentStreak) {
        break;
      }
    }

    const lastUploadDate = videos[0].publishedAt;
    const daysSinceLastUpload = Math.floor((now.getTime() - lastUploadDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // YouTube Algorithm Factors (Real metrics)
    const uploadFrequency = last30Days / 30; // Videos per day
    const consistency = calculateConsistency(videos);
    const recentActivity = last7Days / 7;
    const avgGapBetweenUploads = calculateAvgGap(videos);
    
    // Calculate Algorithm Score (0-100)
    const algorithmScore = calculateYouTubeScore({
      uploadFrequency,
      consistency,
      recentActivity,
      currentStreak,
      avgGapBetweenUploads,
      daysSinceLastUpload
    });

    // Get detailed video data for analysis
    const videoIds = videos.slice(0, 10).map((v: any) => v.videoId).filter(Boolean).join(',');
    const videoTitles = videos.slice(0, 10).map((v: any) => v.title).join(', ');
    
    // Fetch video details (duration to detect shorts)
    let shortsCount = 0;
    let regularVideosCount = 0;
    let avgViewsShorts = 0;
    let avgViewsRegular = 0;
    
    try {
      if (!videoIds) {
        throw new Error('No video IDs found');
      }
      
      const videoDetailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoIds}&key=${process.env.YOUTUBE_API_KEY}`
      );
      const videoDetails = await videoDetailsResponse.json();
      
      console.log('Video details response:', videoDetails);
      
      if (videoDetails.items) {
        videoDetails.items.forEach((video: any) => {
          const duration = video.contentDetails.duration;
          const views = parseInt(video.statistics.viewCount || '0');
          
          // Parse ISO 8601 duration (PT1M30S = 1min 30sec)
          const isShort = parseDuration(duration) <= 60;
          
          if (isShort) {
            shortsCount++;
            avgViewsShorts += views;
          } else {
            regularVideosCount++;
            avgViewsRegular += views;
          }
        });
        
        avgViewsShorts = shortsCount > 0 ? avgViewsShorts / shortsCount : 0;
        avgViewsRegular = regularVideosCount > 0 ? avgViewsRegular / regularVideosCount : 0;
      }
    } catch (error) {
      console.error('Error fetching video details:', error);
    }

    // Use Gemini AI with key rotation
    const apiKey = getNextGeminiKey();
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    // Calculate view prediction for next video
    const viewPrediction = calculateViewPrediction({
      algorithmScore,
      avgViewsShorts,
      avgViewsRegular,
      currentStreak,
      daysSinceLastUpload,
      uploadFrequency
    });
    
    // Calculate optimal upload schedule for next 3 videos
    const optimalSchedule = calculateOptimalSchedule({
      avgGapBetweenUploads,
      currentStreak,
      daysSinceLastUpload,
      last7Days
    });

    const prompt = `You are a YouTube algorithm expert. Analyze this creator's upload pattern:

Channel: ${channelTitle}
Total Videos: ${videos.length}
Shorts: ${shortsCount} (Avg Views: ${Math.round(avgViewsShorts)})
Regular Videos: ${regularVideosCount} (Avg Views: ${Math.round(avgViewsRegular)})
Uploads in last 7 days: ${last7Days}
Uploads in last 30 days: ${last30Days}
Current Streak: ${currentStreak} days
Days since last upload: ${daysSinceLastUpload}
Average gap between uploads: ${avgGapBetweenUploads.toFixed(1)} days
Upload Frequency: ${uploadFrequency.toFixed(2)} videos/day
Consistency Score: ${consistency.toFixed(1)}%
Algorithm Score: ${algorithmScore}/100

Recent video topics: ${videoTitles}

Based on YouTube's recommendation algorithm that favors:
1. Consistent upload schedule (same day/time)
2. Frequent uploads (3-7 videos/week for growth)
3. Topic consistency (niche focus)
4. Avoiding long gaps (>7 days hurts reach)
5. Upload momentum (consecutive days boost)
6. Shorts get more impressions but lower watch time
7. Regular videos build loyal audience

Provide:
1. Should they upload Shorts or Regular video next? (based on their pattern)
2. Predicted view range for next video
3. One actionable recommendation (max 25 words)
4. Algorithm impact prediction

Format:
NEXT_TYPE: [Shorts/Regular]
VIEW_PREDICTION: [min-max range]
RECOMMENDATION: [short advice]
IMPACT: [Boost/Maintain/Risk]`;

    const result = await model.generateContent(prompt);
    const aiResponse = result.response.text();

    // Parse AI response
    const nextTypeMatch = aiResponse.match(/NEXT_TYPE:\s*(.+)/i);
    const viewPredictionMatch = aiResponse.match(/VIEW_PREDICTION:\s*(.+)/i);
    const recommendationMatch = aiResponse.match(/RECOMMENDATION:\s*(.+)/i);
    const impactMatch = aiResponse.match(/IMPACT:\s*(.+)/i);

    const recommendation = recommendationMatch ? recommendationMatch[1].trim() : "Upload consistently for better reach";
    const nextVideoType = nextTypeMatch ? nextTypeMatch[1].trim() : "Regular";
    const aiViewPrediction = viewPredictionMatch ? viewPredictionMatch[1].trim() : "Calculating...";
    const impact = impactMatch ? impactMatch[1].trim() : "Maintain";

    // Prepare recent videos with all data
    const recentVideos = videos.slice(0, 5).map((v: any) => ({
      videoId: v.videoId,
      title: v.title,
      thumbnail: v.thumbnail,
      publishedAt: v.publishedAt
    }));

    console.log('Sending recentVideos:', JSON.stringify(recentVideos, null, 2));

    return NextResponse.json({
      hasChannel: true,
      channelTitle,
      channelId,
      totalVideos: videos.length,
      recentVideos,
      stats: {
        last7Days,
        last14Days,
        last30Days,
        currentStreak,
        daysSinceLastUpload,
        uploadFrequency: uploadFrequency.toFixed(2),
        consistency: consistency.toFixed(1),
        avgGapBetweenUploads: avgGapBetweenUploads.toFixed(1),
        shortsCount,
        regularVideosCount,
        avgViewsShorts: Math.round(avgViewsShorts),
        avgViewsRegular: Math.round(avgViewsRegular),
      },
      algorithmScore,
      recommendation,
      nextVideoType,
      viewPrediction,
      aiViewPrediction,
      optimalSchedule,
      impact,
      aiAnalysis: aiResponse,
    });

  } catch (error) {
    console.error("Error fetching upload streak:", error);
    return NextResponse.json(
      { error: "Failed to fetch upload streak data" },
      { status: 500 }
    );
  }
}

// Calculate upload consistency (how regular are uploads)
// Real YouTube algorithm: Penalizes long gaps and inactivity
function calculateConsistency(videos: any[]): number {
  if (videos.length < 2) return 0;
  
  const now = new Date();
  const lastUploadDate = videos[0].publishedAt;
  const daysSinceLastUpload = Math.floor((now.getTime() - lastUploadDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Heavy penalty for long inactivity (YouTube algorithm)
  if (daysSinceLastUpload > 30) return 0; // 1+ month inactive = 0% consistency
  if (daysSinceLastUpload > 14) return 10; // 2+ weeks inactive = 10% consistency
  if (daysSinceLastUpload > 7) return 30; // 1+ week inactive = 30% consistency
  
  const gaps: number[] = [];
  
  // Include gap from now to last upload (CRITICAL for real algorithm)
  gaps.push(daysSinceLastUpload);
  
  // Calculate gaps between videos
  for (let i = 0; i < videos.length - 1; i++) {
    const gap = Math.abs(
      videos[i].publishedAt.getTime() - videos[i + 1].publishedAt.getTime()
    ) / (1000 * 60 * 60 * 24);
    gaps.push(gap);
  }
  
  const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  const variance = gaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / gaps.length;
  const stdDev = Math.sqrt(variance);
  
  // Lower standard deviation = higher consistency
  // But penalize if average gap is too high
  let consistencyScore = Math.max(0, 100 - (stdDev * 5));
  
  // Additional penalty for large average gaps
  if (avgGap > 7) consistencyScore *= 0.5; // Weekly uploads max
  if (avgGap > 14) consistencyScore *= 0.3; // Bi-weekly = very low
  
  return Math.round(consistencyScore);
}

// Calculate average gap between uploads
function calculateAvgGap(videos: any[]): number {
  if (videos.length < 2) return 0;
  
  let totalGap = 0;
  for (let i = 0; i < videos.length - 1; i++) {
    const gap = Math.abs(
      videos[i].publishedAt.getTime() - videos[i + 1].publishedAt.getTime()
    ) / (1000 * 60 * 60 * 24);
    totalGap += gap;
  }
  
  return totalGap / (videos.length - 1);
}

// YouTube Algorithm Score Calculator (Real Algorithm)
function calculateYouTubeScore(metrics: any): number {
  let score = 0;
  
  // CRITICAL: Days since last upload (YouTube's #1 factor)
  if (metrics.daysSinceLastUpload > 90) {
    // 3+ months inactive = Dead channel (0-5 score)
    return Math.min(5, Math.round(metrics.consistency / 20));
  } else if (metrics.daysSinceLastUpload > 30) {
    // 1+ month inactive = Severely penalized (max 15 score)
    score = Math.min(15, (metrics.consistency / 100) * 15);
    return Math.round(score);
  } else if (metrics.daysSinceLastUpload > 14) {
    // 2+ weeks inactive = Heavy penalty (max 30 score)
    score = Math.min(30, (metrics.consistency / 100) * 30);
    return Math.round(score);
  }
  
  // Upload Frequency (30 points) - 1 video/day = optimal
  if (metrics.uploadFrequency >= 0.5) score += 30;
  else if (metrics.uploadFrequency >= 0.3) score += 20;
  else if (metrics.uploadFrequency >= 0.1) score += 10;
  else if (metrics.uploadFrequency > 0) score += 5;
  
  // Consistency (25 points)
  score += (metrics.consistency / 100) * 25;
  
  // Recent Activity (20 points) - Active in last 7 days
  if (metrics.recentActivity >= 0.5) score += 20;
  else if (metrics.recentActivity >= 0.3) score += 15;
  else if (metrics.recentActivity >= 0.1) score += 10;
  else score += 0; // No recent activity = 0 points
  
  // Current Streak (15 points)
  if (metrics.currentStreak >= 7) score += 15;
  else if (metrics.currentStreak >= 3) score += 10;
  else if (metrics.currentStreak >= 1) score += 5;
  else score += 0; // No streak = 0 points
  
  // Gap Bonus/Penalty (10 points)
  if (metrics.daysSinceLastUpload <= 1) score += 10; // Daily = bonus
  else if (metrics.daysSinceLastUpload <= 3) score += 7; // Every 3 days = good
  else if (metrics.daysSinceLastUpload <= 7) score += 3; // Weekly = okay
  else score -= 5; // 7+ days = penalty
  
  return Math.max(0, Math.min(100, Math.round(score)));
}

// Parse ISO 8601 duration to seconds
function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  if (!match) return 0;
  
  const hours = (match[1] || '').replace('H', '');
  const minutes = (match[2] || '').replace('M', '');
  const seconds = (match[3] || '').replace('S', '');
  
  return (parseInt(hours) || 0) * 3600 + (parseInt(minutes) || 0) * 60 + (parseInt(seconds) || 0);
}

// Calculate view prediction for next video
function calculateViewPrediction(metrics: any) {
  const baseViews = Math.max(metrics.avgViewsShorts, metrics.avgViewsRegular);
  
  // Algorithm boost/penalty multipliers
  let multiplier = 1.0;
  
  // Streak bonus (up to 1.5x)
  if (metrics.currentStreak >= 7) multiplier += 0.5;
  else if (metrics.currentStreak >= 3) multiplier += 0.3;
  else if (metrics.currentStreak >= 1) multiplier += 0.1;
  
  // Frequency bonus
  if (metrics.uploadFrequency >= 0.5) multiplier += 0.3;
  else if (metrics.uploadFrequency >= 0.3) multiplier += 0.2;
  
  // Gap penalty
  if (metrics.daysSinceLastUpload > 14) multiplier -= 0.4;
  else if (metrics.daysSinceLastUpload > 7) multiplier -= 0.2;
  
  // Algorithm score impact
  multiplier += (metrics.algorithmScore - 50) / 100;
  
  const predictedViews = Math.round(baseViews * multiplier);
  const minViews = Math.round(predictedViews * 0.7);
  const maxViews = Math.round(predictedViews * 1.3);
  
  return {
    shorts: {
      min: Math.round(metrics.avgViewsShorts * multiplier * 0.7),
      max: Math.round(metrics.avgViewsShorts * multiplier * 1.3),
      avg: Math.round(metrics.avgViewsShorts * multiplier),
      chance: metrics.avgViewsShorts > metrics.avgViewsRegular ? 'High' : 'Medium'
    },
    regular: {
      min: Math.round(metrics.avgViewsRegular * multiplier * 0.7),
      max: Math.round(metrics.avgViewsRegular * multiplier * 1.3),
      avg: Math.round(metrics.avgViewsRegular * multiplier),
      chance: metrics.avgViewsRegular > metrics.avgViewsShorts ? 'High' : 'Medium'
    },
    multiplier: multiplier.toFixed(2)
  };
}

// Calculate optimal upload schedule for next 3 videos
function calculateOptimalSchedule(metrics: any) {
  const now = new Date();
  const schedule = [];
  
  // Determine optimal gap based on current pattern
  let optimalGap = 3; // Default: 3 days
  
  if (metrics.last7Days >= 5) {
    optimalGap = 1; // Daily uploads
  } else if (metrics.last7Days >= 3) {
    optimalGap = 2; // Every 2 days
  } else if (metrics.avgGapBetweenUploads > 0) {
    optimalGap = Math.min(Math.round(metrics.avgGapBetweenUploads), 7);
  }
  
  // If streak is active, maintain it
  if (metrics.currentStreak > 0 && metrics.daysSinceLastUpload <= 1) {
    optimalGap = 1;
  }
  
  // Calculate next 3 upload dates
  for (let i = 1; i <= 3; i++) {
    const uploadDate = new Date(now);
    uploadDate.setDate(uploadDate.getDate() + (optimalGap * i));
    
    schedule.push({
      videoNumber: i,
      date: uploadDate.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      daysFromNow: optimalGap * i,
      reason: i === 1 ? 'Maintain momentum' : i === 2 ? 'Build consistency' : 'Establish pattern'
    });
  }
  
  return {
    optimalGap,
    schedule,
    strategy: optimalGap === 1 ? 'Daily uploads for maximum growth' : 
              optimalGap === 2 ? 'Every 2 days for sustainable growth' :
              'Weekly uploads for quality focus'
  };
}
