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

    if (startupRecord.businessPlan?.competitors) {
       return NextResponse.json({ market: JSON.parse(startupRecord.businessPlan.competitors) });
    }

    const { businessName, tagline, description } = startupRecord;

    const prompt = `
Generate a structured market analysis for ${businessName}.
Tagline: ${tagline}
Description: ${description}

Return JSON exactly in this format:
{
  "competitors": [
    {
      "name": "Competitor 1",
      "strength": "High brand recognition",
      "weakness": "Outdated technology"
    },
    {
      "name": "Competitor 2",
      "strength": "Large user base",
      "weakness": "Poor customer service"
    },
    {
      "name": "Competitor 3",
      "strength": "Deep pockets",
      "weakness": "Slow innovation"
    }
  ],
  "swot": {
    "strengths": ["Proprietary AI", "Low cost"],
    "weaknesses": ["New brand", "Small team"],
    "opportunities": ["Emerging markets", "Strategic partnerships"],
    "threats": ["Large incumbents", "Cybersecurity risk"]
  }
}

The analysis should be insightful and professional.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a professional market research analyst. Always respond ONLY with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    });

    let text = completion.choices[0].message.content || "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);
    const marketJson = JSON.stringify(parsed);

    const plan = await prisma.businessPlan.upsert({
      where: { startupId },
      create: {
        startupId,
        competitors: marketJson
      },
      update: {
        competitors: marketJson
      }
    });

    return NextResponse.json({ market: JSON.parse(plan.competitors || "{}") });

  } catch (error) {
    console.error("API Market Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
