import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";

type Thumbnail = {
  id: number;
  thumbnailUrl: string;
  refImage?: string;
  userInput: string;
};

function ThumbnailList() {
  const [thumbnailList, setThumbnailList] = useState<Thumbnail[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    GetThumbnailList();
  }, []);

  const GetThumbnailList = async () => {
    setLoading(true);
    try {
      const result = await axios.get("/api/generate-thumbnail");
      console.log(result.data);
      setThumbnailList(result.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching thumbnails:", error);
      setLoading(false);
    }
  };

  return (
    <div className="mt-10">
      <h2 className="font-bold text-xl">Previously Generated Thumbnails</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {!loading
          ? thumbnailList.map((thumbnail, index) => (
              <div key={index} className="rounded-xl overflow-hidden shadow cursor-pointer" onClick={() => setSelectedImage(thumbnail.thumbnailUrl)}>
                <img
                  src={thumbnail.thumbnailUrl}
                  alt="Thumbnail"
                  className="w-full aspect-video rounded-xl object-cover hover:scale-105 transition-all"
                />
                <p className="mt-2 text-sm text-gray-700">
                  {thumbnail.userInput}
                </p>
              </div>
            ))
          : [1, 2, 3, 4, 5, 6].map((item, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden shadow bg-gray-200 animate-pulse h-[180px] w-full"
              />
            ))}
      </div>

      {/* Fullscreen Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white bg-red-500 rounded-full p-2 hover:scale-110 transition-all" onClick={() => setSelectedImage(null)}>
            <X size={24} />
          </button>
          <img src={selectedImage} alt="Fullscreen" className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
}

export default ThumbnailList;
