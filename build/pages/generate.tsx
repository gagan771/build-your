import { GetServerSideProps } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useState } from "react";
import SitePreview from "../components/SitePreview";

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!userId) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return { props: {} };
};

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    console.log("🚀 Form submitted with prompt:", prompt);
    setLoading(true);
    setResult(null);
    setError(null);
    
    try {
      console.log("📡 Sending request to /api/generate...");
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      
      console.log("📥 Response status:", res.status);
      console.log("📥 Response headers:", Object.fromEntries(res.headers.entries()));
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ API Error:", errorText);
        throw new Error(`Failed to generate website: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log("✅ API Response:", data);
      setResult(data.generatedCode);
    } catch (error) {
      console.error("❌ Frontend error:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  const downloadWebsite = () => {
    if (!result) return;
    
    const blob = new Blob([result], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated-website.html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <SignedIn>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Website Generator
            </h1>
            <p className="text-gray-600">
              Describe the website you want to create and we'll generate it for you.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Describe Your Website
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                    What kind of website do you want?
                  </label>
                  <textarea
                    id="prompt"
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Describe your website... (e.g., 'A modern portfolio website for a photographer with a dark theme and image gallery', 'A business website for a restaurant with menu and contact information', 'A blog website with clean design')"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    required
                  />
                </div>
                
                <button
                  type="submit"
                  className="btn-primary w-full"
                  disabled={loading || !prompt.trim()}
                >
                  {loading ? "Generating..." : "Generate Website"}
                </button>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
              </form>
            </div>

            {/* Preview Section */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Live Preview
              </h2>
              
              {result ? (
                <div className="space-y-4">
                  <SitePreview code={result} />
                  
                  <div className="flex gap-2">
                    <button
                      onClick={downloadWebsite}
                      className="btn-success"
                    >
                      Download HTML
                    </button>
                    <button
                      onClick={() => setResult(null)}
                      className="btn-secondary"
                    >
                      Generate New
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-96 bg-gray-100 rounded-md flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="text-4xl mb-2">📄</div>
                    <p>Your generated website will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tips Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              💡 Tips for Better Results
            </h3>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Mention the type of website (portfolio, blog, business, etc.)</li>
              <li>• Specify the theme (dark, light, colorful, minimal)</li>
              <li>• Include specific features you want (contact form, gallery, etc.)</li>
              <li>• Describe the target audience or purpose</li>
            </ul>
          </div>
        </div>
      </div>
    </SignedIn>
  );
} 