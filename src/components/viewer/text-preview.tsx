'use client';

import React from 'react';

interface TextPreviewProps {
  url: string;
}

export function TextPreview({ url }: TextPreviewProps) {
  const [content, setContent] = React.useState<string>('');
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchText = async () => {
      try {
        setLoading(true);
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load text file');
        const text = await response.text();
        setContent(text);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchText();
  }, [url]);

  if (loading) return <div className="text-gray-500">Loading content...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="w-full h-full overflow-auto bg-white p-6 shadow-sm">
      <pre className="font-mono text-sm whitespace-pre-wrap break-words">
        {content}
      </pre>
    </div >
  );
}

export default TextPreview;
