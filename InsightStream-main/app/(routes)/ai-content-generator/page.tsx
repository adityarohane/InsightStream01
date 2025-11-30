'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Edit3 } from 'lucide-react';
import ContentDisplay from './_Components/ContentDisplay';
import { RunStatus } from '@/services/GlobalApi';

export type SubContent = {
  title: string;
  description: string;
  tags: string[];
  seo_score: number;
};

export type Content = {
  id: number;
  userInput: string;
  subContent: SubContent[];
  thumbnailUrl: string;
  createdOn: string;
};

function AiContentGenerator() {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<Content | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setError(null);
    setContent(null);

    try {
      const response = await fetch('/api/ai-content-generator', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: prompt }),
      });

      // Check if response is HTML (error page)
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        // Check if it's an HTML error page
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error(`Server returned HTML error page. Status: ${response.status}`);
        }
        throw new Error(`Unexpected HTML response: ${text.substring(0, 100)}`);
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }

      // Ensure it's JSON
      if (!contentType?.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${contentType}`);
      }

      const data = await response.json();
      
      // Validate response structure
      if (!data || !data.aiContent) {
        throw new Error('Invalid response format: missing aiContent');
      }

      const aiContent = data.aiContent;

      // Wait for Inngest run if available (with timeout)
      if (data.runId) {
        const maxWaitTime = 30000; // 30 seconds timeout
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
          try {
            const runStatus = await RunStatus(data.runId);
            const status = runStatus?.[0]?.status;
            
            if (status === 'Completed') break;
            if (status === 'Cancelled' || status === 'Failed') {
              throw new Error(`Content generation ${status.toLowerCase()}`);
            }
            
            await new Promise((res) => setTimeout(res, 1000));
          } catch (error) {
            console.warn('Error checking run status:', error);
            // Continue with available data if status check fails
            break;
          }
        }
        
        if (Date.now() - startTime >= maxWaitTime) {
          console.warn('Run status check timeout, proceeding with available data');
        }
      }

      // Validate and transform the data
      if (!aiContent.subContent || !Array.isArray(aiContent.subContent)) {
        throw new Error('Invalid response: subContent array is missing');
      }

      setContent({
        id: Date.now(),
        userInput: prompt,
        subContent: aiContent.subContent.map((item: any) => ({
          title: item.title || 'Untitled',
          description: item.description || 'No description',
          tags: Array.isArray(item.tags) ? item.tags : [],
          seo_score: typeof item.seo_score === 'number' ? item.seo_score : 0,
        })),
        thumbnailUrl: data.thumbnailUrl || '',
        createdOn: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error generating AI content:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
      setContent(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 md:px-20 lg:px-40">
      <div className="flex flex-col items-center text-center mt-20 gap-4">
        <h2 className="font-bold text-4xl">AI Content Generator</h2>
        <p className="text-gray-400 max-w-2xl">
          Generate creative and high-quality content instantly using our AI-powered tool.
        </p>
      </div>

      {/* Input */}
      <div className="max-w-2xl mx-auto mt-8 p-2 border rounded-xl flex items-center gap-2 bg-secondary">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your value to generate content"
          className="w-full p-2 outline-none bg-transparent"
          onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
        />
        <Button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className="flex gap-2 items-center px-5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 transition-all shadow-md disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Generating...
            </>
          ) : (
            <>
              <Edit3 className="h-4 w-4" /> Generate
            </>
          )}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="max-w-2xl mx-auto mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Error: {error}</p>
          <p className="text-red-600 text-sm mt-2">
            Please check if the API route exists and try again.
          </p>
        </div>
      )}

      {/* Display */}
      {content && <ContentDisplay content={content} loading={loading} />}
    </div>
  );
}

export default AiContentGenerator;