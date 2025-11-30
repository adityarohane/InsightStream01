import React from 'react';
import { Content } from '../page';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  content: Content;
  loading: boolean;
};

function ContentDisplay({ content, loading }: Props) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 mt-8">
        <Skeleton className="w-full h-[200px] rounded-lg" />
        <Skeleton className="w-full h-[200px] rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left: Titles + SEO score + Tags */}
      <div className="space-y-4">
        {content.subContent.map((item, index) => (
          <div
            key={index}
            className="bg-blue-50 p-4 rounded-lg shadow-md border-l-4 border-blue-500"
          >
            <h3 className="font-semibold text-lg text-blue-700 flex justify-between items-center">
              {item.title}
              <span className="text-sm font-medium text-blue-500">{item.seo_score}</span>
            </h3>
            {item.tags && (
              <p className="text-sm text-blue-600 mt-2">{item.tags.join(', ')}</p>
            )}
          </div>
        ))}
      </div>

      {/* Right: Description */}
      <div className="space-y-4">
        {content.subContent.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-gray-700">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContentDisplay;
