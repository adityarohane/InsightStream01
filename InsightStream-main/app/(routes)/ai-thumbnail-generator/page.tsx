"use client"
import { ArrowUp, Download, ImagePlus, Loader2, User, X } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import axios from 'axios'
import { RunStatus } from '@/services/GlobalApi'
import ThumbnailList from '../_components/ThumbnailList'

function AiThumbnailGeneratorPage() {
  const [userInput, setUserInput] = useState<string>('')
  const [referenceImage, setReferenceImage] = useState<File | null>(null)
  const [faceImage, setFaceImage] = useState<File | null>(null)
  const [referenceImagePreview, setReferenceImagePreview] = useState<string>()
  const [faceImagePreview, setFaceImagePreview] = useState<string>()
  const [loading, setLoading] = useState(false);
  const [outputThumbnailImage,setOutputThumbnailImage]=useState<string | null>(null);

  const onHandleFileChange = (field: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    if (field === 'referenceImage') {
      setReferenceImage(selectedFile)
      setReferenceImagePreview(URL.createObjectURL(selectedFile))
    } else {
      setFaceImage(selectedFile)
      setFaceImagePreview(URL.createObjectURL(selectedFile))
    }
  }

  const onSubmit = async () => {
    setLoading(true);
    if (!userInput.trim()) {
      alert('Please enter a video title or description')
      return
    }

    try {
      const formData = new FormData()
      formData.append('userInput', userInput)
      if (referenceImage) formData.append('refImage', referenceImage)
      if (faceImage) formData.append('faceImage', faceImage)

      // Post API CALL
      const response = await axios.post('/api/generate-thumbnail', formData)
      console.log(response.data)

      // Direct response - no polling needed
      if (response.data.success && response.data.thumbnailUrl) {
        setOutputThumbnailImage(response.data.thumbnailUrl)
        setLoading(false)
        alert('Thumbnail generated successfully!')
      } else {
        throw new Error('No thumbnail URL received')
      }
    } catch (error) {
      console.error('Error generating thumbnail:', error)
      alert('Error generating thumbnail. Please try again.')
      setLoading(false)
    }
  }

  const removeReferenceImage = () => {
    setReferenceImage(null)
    setReferenceImagePreview(undefined)
  }

  const removeFaceImage = () => {
    setFaceImage(null)
    setFaceImagePreview(undefined)
  }

  return (
    <div>
      <div className="flex items-center text-center justify-center mt-20 flex-col gap-2">
        <h2 className="font-bold text-4xl">AI Thumbnail Generator</h2>
        <p className="text-gray-400 text-center max-w-2xl">
          Transform any video into a click-worthy thumbnail that grabs attention and boosts views. 
          With our AI YouTube thumbnail maker, you get professional designs instantly—no design skills required.
        </p>
      </div>

      {/* Thumbnail or Loading State */}
      <div>
        {loading ? (
          <div className="w-full bg-secondary border rounded-2xl h-[250px] mt-6 flex flex-col items-center justify-center gap-4 animate-pulse">
            <Loader2 className="h-10 w-10 text-red-500 animate-spin" />
            <h2 className="text-lg font-medium text-gray-300">
              Please wait... Generating your thumbnail
            </h2>
            <p className="text-sm text-gray-400">This may take a few seconds</p>
          </div>
        ) : (
          <div>
            {outputThumbnailImage && (
              <div className="relative group">
                <Image
                  src={outputThumbnailImage}
                  alt="Generated Thumbnail"
                  width={500}
                  height={400}
                  className="aspect-video w-full rounded-lg shadow-md transition-all duration-500 hover:scale-[1.02]"
                />
                <a
                  href={outputThumbnailImage}
                  download="thumbnail.png"
                  className="absolute top-4 right-4 bg-gradient-to-t from-red-500 to-orange-500 text-white p-3 rounded-full shadow-lg hover:scale-110 transition-all cursor-pointer flex items-center gap-2"
                >
                  <Download size={20} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Field */}
      <div className="flex gap-5 items-center p-3 border rounded-xl mt-10">
        <textarea
          placeholder="Enter your youtube video title or description"
          className="w-full outline-0 bg-transparent"
          value={userInput}
          onChange={(event) => setUserInput(event.target.value)}
        />
        <div 
          className="p-3 bg-gradient-to-t from-red-500 to-orange-500 rounded-full cursor-pointer disabled:opacity-50" 
          onClick={onSubmit}
          style={{ pointerEvents: loading ? 'none' : 'auto' }}
        >
          <ArrowUp className={loading ? 'animate-spin' : ''} />
        </div>
      </div>

      {/* Uploads */}
      <div className="mt-3 flex gap-3">
        {/* Reference Image Upload */}
        <label htmlFor="referenceImageUpload" className="w-full cursor-pointer">
          {!referenceImagePreview ? (
            <div className="p-4 w-full border rounded-xl bg-secondary flex gap-2 items-center hover:scale-105 transition-all">
              <ImagePlus />
              <h2>Reference Image</h2>
            </div>
          ) : (
            <div className='relative'>
              <X 
                className='absolute top-1 right-1 cursor-pointer bg-red-500 text-white rounded-full p-1 z-10'
                size={20}
                onClick={removeReferenceImage}
              />
              <Image
                src={referenceImagePreview}
                alt="Reference Image"
                width={70}
                height={70}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </label>
        <input
          type="file"
          id="referenceImageUpload"
          className="hidden"
          accept="image/*"
          onChange={(e) => onHandleFileChange('referenceImage', e)}
        />

        {/* Face Image Upload */}
        <label htmlFor="includeFace" className="w-full cursor-pointer">
          {!faceImagePreview ? (
            <div className="p-4 w-full border rounded-xl bg-secondary flex gap-2 items-center hover:scale-105 transition-all">
              <User />
              <h2>Include Face</h2>
            </div>
          ) : (
            <div className='relative'>
              <X 
                className='absolute top-1 right-1 cursor-pointer bg-red-500 text-white rounded-full p-1 z-10'
                size={20}
                onClick={removeFaceImage}
              />
              <Image
                src={faceImagePreview}
                alt="Face Image"
                width={70}
                height={70}
                className="rounded-md object-cover"
              />
            </div>
          )}
        </label>
        <input
          type="file"
          id="includeFace"
          className="hidden"
          accept="image/*"
          onChange={(e) => onHandleFileChange('faceImage', e)}
        />
      </div>

      {loading && (
        <div className="mt-4 text-center">
          <p className="text-gray-500">Generating thumbnail...</p>
        </div>
      )}

      <ThumbnailList/>
    </div>
  )
}

export default AiThumbnailGeneratorPage
