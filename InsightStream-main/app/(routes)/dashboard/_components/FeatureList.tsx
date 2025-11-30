import Image from "next/image";
import Link from "next/link";
import React from "react";

const Features = [
  {
    id: 1,
    title: "AI Thumbnail Generator",
    image: "/F1.png",
    path: "/ai-thumbnail-generator",
  },
  {
    id: 2,
    title: "Thumbnail Search",
    image: "/F2.png",
    path: "/thumbnail-search",
  },
  {
    id: 3,
    title: "Keyword Research",
    image: "/F5.png",
    path: "/trending-keywords",
  },
  {
    id: 4,
    title: "Hashtag Generator",
    image: "/F6.png",
    path: "/keyword-research",
  },
  {
    id: 5,
    title: "Outlier Detection",
    image: "/F4.png",
    path: "/outlier",
  },
  {
    id: 6,
    title: "Upload Streak Tracker",
    image: "/streak.jpg",
    path: "/upload-streak",
  },
  {
    id: 7,
    title: "AI Content Generator",
    image: "/F3.png",
    path: "/ai-content-generator",
  },
];

function FeatureList() {
  return (
    <div className="mt-7">
      <h2 className="font-bold text-2xl mb-5">AI Tools</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {Features.map((feature) => (
          <Link key={feature.id} href={feature.path}>
            <div className="flex flex-col items-center cursor-pointer hover:scale-105 transition-transform">
              <Image
                src={feature.image}
                alt={feature.title}
                width={200}
                height={200}
                className="w-full h-[150px] object-cover rounded-lg shadow-md"
              />
              <p className="mt-2 text-center font-medium">{feature.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default FeatureList;
