"use client";

import { useEffect, useRef, useState } from "react";
import { WebContainer } from "@webcontainer/api";

export default function SitePreview({ code }: { code: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPreview() {
      try {
        setIsLoading(true);
        setError(null);

        const webcontainer = await WebContainer.boot();

        // Mount the files to the virtual filesystem
        await webcontainer.mount({
          "index.html": { 
            file: { 
              contents: code 
            } 
          },
          "package.json": {
            file: {
              contents: JSON.stringify({
                name: "preview",
                version: "1.0.0",
                type: "module",
                scripts: {
                  dev: "npx serve . -p 3000"
                },
                dependencies: {
                  "serve": "^14.2.1"
                }
              }),
            },
          },
        });

        // Install dependencies
        const install = await webcontainer.spawn("npm", ["install"]);
        await install.exit;

        // Start the server
        const proc = await webcontainer.spawn("npm", ["run", "dev"]);

        // Handle server output
        proc.output.pipeTo(
          new WritableStream({
            write(data) {
              console.log("Server output:", data);
            },
          })
        );

        // Wait for server to start and get the URL
        await new Promise(resolve => setTimeout(resolve, 3000));

        // For now, use a simple iframe with the HTML content directly
        // This avoids the WebContainer URL issue
        if (iframeRef.current) {
          iframeRef.current.srcdoc = code;
          setIsLoading(false);
        }
      } catch (err) {
        console.error("WebContainer error:", err);
        setError(err instanceof Error ? err.message : "Failed to load preview");
        setIsLoading(false);
      }
    }

    if (code) {
      loadPreview();
    }
  }, [code]);

  return (
    <div className="mt-6 border rounded-lg overflow-hidden bg-white">
      <div className="bg-gray-100 px-4 py-2 border-b">
        <h3 className="text-sm font-medium text-gray-700">Live Preview</h3>
      </div>
      
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading preview...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 bg-red-50 flex items-center justify-center">
            <div className="text-center">
              <p className="text-sm text-red-600">Failed to load preview: {error}</p>
            </div>
          </div>
        )}
        
        <iframe 
          ref={iframeRef} 
          className="w-full h-[500px] border-0" 
          title="Website Preview"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
