import React, { useState, useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';


function App() {
  const [markdown, setMarkdown] = useState('# Welcome to Markdown Editor\n\nStart typing in **Markdown** format and see the _preview_ in real-time!\n\n');
  const [preview, setPreview] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3001');
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      if (markdown) {
        ws.send(markdown);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.html) {
        setPreview(DOMPurify.sanitize(data.html));
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(markdown);
      }
    }, 300);

    return () => clearTimeout(debounceTimeout);
  }, [markdown]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      alert('Markdown copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-semibold text-gray-900">Markdown Editor</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Copy
            </button>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700"
            >
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center">
              <h2 className="text-lg font-medium text-gray-900">Editor</h2>
            </div>
            <div className="p-4">
              <textarea
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                className="w-full h-[calc(100vh-300px)] p-4 border-0 focus:ring-0 font-mono text-sm resize-none"
                placeholder="Type your Markdown here..."
              />
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center">
              <h2 className="text-lg font-medium text-gray-900">Preview</h2>
            </div>
            <div 
              className="prose max-w-none p-6 overflow-auto h-[calc(100vh-300px)]"
              dangerouslySetInnerHTML={{ __html: preview }}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;