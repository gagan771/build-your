import type { NextApiRequest, NextApiResponse } from "next";

// TODO: Add your Gemini API key to .env.local
// GEMINI_API_KEY=your_gemini_api_key_here

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🔍 API CALL RECEIVED:", {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: {
      'content-type': req.headers['content-type'],
      'user-agent': req.headers['user-agent']
    }
  });

  if (req.method !== "POST") {
    console.log("❌ Method not allowed:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body;

  if (!prompt || typeof prompt !== "string") {
    console.log("❌ Invalid prompt:", prompt);
    return res.status(400).json({ error: "Invalid prompt" });
  }

  console.log("✅ Valid prompt received:", prompt);

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === "your_gemini_api_key_here") {
    console.log("❌ Gemini API key not set");
    return res.status(500).json({ error: "Gemini API key not set. Please add GEMINI_API_KEY to your .env.local file." });
  }

  console.log("🔑 Gemini API key is set (length:", process.env.GEMINI_API_KEY?.length, ")");

  try {
    console.log("🚀 Calling Gemini API with prompt:", prompt);
    const geminiResponse = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate a complete HTML website based on this description: "${prompt}". \nReturn only the HTML code with embedded CSS and JavaScript. \nMake it modern, responsive, and functional. Include proper meta tags, viewport settings, and semantic HTML structure.`
          }]
        }]
      })
    });

    console.log("📡 Gemini response status:", geminiResponse.status);

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error('❌ Gemini API error:', errorBody);
      throw new Error('Failed to generate with Gemini');
    }

    const geminiData = await geminiResponse.json();
    console.log("✅ Gemini response received, candidates:", geminiData.candidates?.length || 0);
    const generatedCode = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "<p>Failed to generate website.</p>";

    return res.status(200).json({ 
      generatedCode,
      message: "Website generated successfully! (via Gemini)"
    });
  } catch (error) {
    console.error("❌ Generation error:", error);
    return res.status(500).json({ error: "Failed to generate website" });
  }
} 