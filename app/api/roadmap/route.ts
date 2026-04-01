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

    if (startupRecord.businessPlan?.roadmap) {
       return NextResponse.json({ roadmap: JSON.parse(startupRecord.businessPlan.roadmap) });
    }

    const { businessName, tagline, description } = startupRecord;

    const prompt = `
Generate a structured 12-month startup roadmap for ${businessName}.
Tagline: ${tagline}
Description: ${description}

Return JSON exactly in this format:
{
  "milestones": [
    {
      "month": 1,
      "title": "Founding & MVP Design",
      "description": "Establish core vision and prototype the first module.",
      "tasks": ["Finalize whitepaper", "Setup cloud infrastructure"]
    }
    // ... total 12 months
  ]
}

The roadmap should be realistic and detailed for a tech startup.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a professional project manager for startups. Always respond ONLY with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    });

    let text = completion.choices[0].message.content || "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);
    const roadmapJson = JSON.stringify(parsed.milestones);

    const plan = await prisma.businessPlan.upsert({
      where: { startupId },
      create: {
        startupId,
        roadmap: roadmapJson
      },
      update: {
        roadmap: roadmapJson
      }
    });

    return NextResponse.json({ roadmap: JSON.parse(plan.roadmap || "[]") });

  } catch (error) {
    console.error("API Roadmap Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
