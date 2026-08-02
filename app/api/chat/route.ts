import { NextRequest, NextResponse } from "next/server";

// Use env var first; if not set (e.g. Vercel env not configured), fall back to hardcoded key.
// Once GEMINI_API_KEY is set in Vercel Settings → Environment Variables, the hardcoded value
// below can be safely removed.
const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? "AIzaSyB8RN6IyzdkdiO0VUa9WcpE3WYI4U4fes1WW7RNU04gQEAWHmQ";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body?.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const apiKey = GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key is not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "Gemini API request failed" },
        { status: response.status }
      );
    }

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I couldn't generate a response.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
