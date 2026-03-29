import OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { idea, theme } = await req.json();

    if (!idea) {
      return NextResponse.json({ error: "No idea provided" }, { status: 400 });
    }

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: "You generate startup ideas. Always respond ONLY with JSON.",
        },
        {
          role: "user",
          content: `Generate a startup idea for: ${idea}

Return JSON exactly like this:

{
 "business_name": "",
 "tagline": "",
 "description": "",
 "products": ["", "", ""]
}
`,
        },
      ],
      temperature: 0.7,
    });

    let text = completion.choices[0].message.content || "";
    // Clean markdown JSON formatting if the model wraps it
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    const result = JSON.parse(text);

    // Save to Database
    const startupRecord = await prisma.startup.create({
      data: {
        ideaPrompt: idea,
        businessName: result.business_name || "Unknown Business",
        tagline: result.tagline || "",
        description: result.description || "",
        products: JSON.stringify(result.products || []),
        theme: theme || "blue",
      },
      include: {
        website: true,
        businessPlan: true
      }
    });

    return NextResponse.json(startupRecord);

  } catch (error) {
    console.error("API Generate Error:", error);

    // Return a fallback just in case
    return NextResponse.json({
      businessName: "Fallback Startup",
      tagline: "AI Response Failed",
      description: "The AI response failed or API configuration is incorrect. Make sure GROQ_API_KEY is valid.",
      products: JSON.stringify(["Product 1", "Product 2", "Product 3"]),
    }, { status: 500 });
  }
}