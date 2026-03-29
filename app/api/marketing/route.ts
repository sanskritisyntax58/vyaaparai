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

    // Try finding existing marketing Plan to not double charge API
    if (startupRecord.businessPlan?.marketingPlan) {
       return NextResponse.json({ markdown: startupRecord.businessPlan.marketingPlan });
    }

    const { businessName, tagline, description, products } = startupRecord;
    const parsedProducts = JSON.parse(products || "[]");

    const prompt = `
Generate a comprehensive Marketing Plan for the startup:
Name: ${businessName}
Tagline: ${tagline}
Description: ${description}

Products:
${parsedProducts.join(", ")}

Return ONLY valid Markdown format. Include:
1. Executive Summary
2. Target Audience & Personas
3. Competitive Analysis
4. Marketing Channels (Paid, Organic, Social Media)
5. Content Strategy
6. Launch Timeline & KPIs

Format beautifully with Markdown headers and bullet points.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    let markdown = completion.choices[0].message.content || "Plan generation failed.";
    markdown = markdown.trim();

    // Update or Create BusinessPlan
    const plan = await prisma.businessPlan.upsert({
      where: { startupId },
      create: {
        startupId,
        marketingPlan: markdown
      },
      update: {
        marketingPlan: markdown
      }
    });

    return NextResponse.json({ markdown: plan.marketingPlan });

  } catch (error) {
    console.error("API Marketing Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
