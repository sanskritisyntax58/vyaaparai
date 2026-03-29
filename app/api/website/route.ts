import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { startupId } = await req.json();

    if (!startupId) {
       return NextResponse.json({ error: "Missing startupId" }, { status: 400 });
    }

    const startupRecord = await prisma.startup.findUnique({
      where: { id: startupId }
    });

    if (!startupRecord) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    // Try finding existing website to not double charge API
    const existing = await prisma.website.findUnique({
      where: { startupId }
    });

    if (existing) {
       return NextResponse.json({ html: existing.html });
    }

    const { businessName, tagline, description, products } = startupRecord;
    const parsedProducts = JSON.parse(products || "[]");

    const prompt = `
Generate a single page modern startup landing page HTML.

Startup Name: ${businessName}
Tagline: ${tagline}
Description: ${description}

Products to feature:
${parsedProducts.join(", ")}

Return ONLY valid HTML code. No markdown formatting, just the raw HTML.
Page must include:
- Hero section with gradient background
- About section explaining the vision
- Product cards for each product
- Features section
- Testimonials
- Call to action
- Footer

Style rules: Use Tailwind CSS via CDN (<script src="https://cdn.tailwindcss.com"></script>). Make it sleek, dark mode default, rounded corners, gradient texts, and mobile friendly.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let html = completion.choices[0].message.content || "";
    // Clean up
    html = html.replace(/```html/gi, "").replace(/```/g, "").trim();

    if (!html || html.length < 50) {
      html = `
        <html>
        <body style="font-family:sans-serif;padding:40px">
        <h1>Website Preview</h1>
        <p>The AI response was empty. Please try again later.</p>
        </body>
        </html>
      `;
    }

    const website = await prisma.website.create({
      data: {
        html,
        startupId
      }
    });

    return NextResponse.json({ html: website.html });

  } catch (error) {
    console.error("API Website Error:", error);
    return NextResponse.json({
      html: `
        <html>
        <body style="font-family:sans-serif;padding:40px">
        <h1>Website Preview</h1>
        <p>AI generation failed temporarily. ${String(error)}</p>
        </body>
        </html>
      `
    }, { status: 500 });
  }
}