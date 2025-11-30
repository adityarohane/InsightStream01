import { Skeleton } from '@/components/ui/skeleton'
import React from 'react'

function VideoListSkeleton() {
  return (
    <div className="mt-10">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-lg p-3 shadow-md animate-pulse">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4 mt-3" />
            <Skeleton className="h-3 w-1/2 mt-2" />
            <Skeleton className="h-3 w-1/3 mt-2" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default VideoListSkeleton

