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
      where: { id: startupId },
      include: { businessPlan: true }
    });

    if (!startupRecord) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    if (startupRecord.businessPlan?.pitchDeck) {
       return NextResponse.json({ markdown: startupRecord.businessPlan.pitchDeck });
    }

    const { businessName, tagline, description, products } = startupRecord;
    const parsedProducts = JSON.parse(products || "[]");

    const prompt = `
Generate a textual Pitch Deck structure for a startup seeking seed funding:

Startup Name: ${businessName}
Tagline: ${tagline}
Description: ${description}
Products: ${parsedProducts.join(", ")}

Generate a Slide-by-Slide Markdown document. Include these classic slides:
Slide 1: Title & Vision
Slide 2: The Problem
Slide 3: The Solution
Slide 4: Market Size
Slide 5: Product Setup
Slide 6: Business Model
Slide 7: Go-To-Market
Slide 8: Financial Projections
Slide 9: The Target Ask

Make it compelling, professional, and convincing for a VC.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    let markdown = completion.choices[0].message.content || "Pitch Generation Failed.";
    markdown = markdown.trim();

    const plan = await prisma.businessPlan.upsert({
      where: { startupId },
      create: {
        startupId,
        pitchDeck: markdown
      },
      update: {
        pitchDeck: markdown
      }
    });

    return NextResponse.json({ markdown: plan.pitchDeck });

  } catch (error) {
    console.error("API Pitch Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
