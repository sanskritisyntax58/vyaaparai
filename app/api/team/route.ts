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

    if (startupRecord.businessPlan?.team) {
       return NextResponse.json({ team: JSON.parse(startupRecord.businessPlan.team) });
    }

    const { businessName, tagline, description } = startupRecord;

    const prompt = `
Generate a structured JSON team for a startup called ${businessName}.
Tagline: ${tagline}
Description: ${description}

Return exactly 3 co-founder profiles.
Return JSON exactly in this format:
{
  "team": [
    {
      "name": "Full Name",
      "role": "CEO / CTO / etc.",
      "bio": "Short 1-2 sentence professional bio emphasizing why they are the perfect fit for this specific startup.",
      "skills": ["Skill 1", "Skill 2", "Skill 3"],
      "image": "/placeholder-user.png"
    }
  ]
}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a professional hiring consultant for startups. Always respond ONLY with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    });

    let text = completion.choices[0].message.content || "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);
    const teamJson = JSON.stringify(parsed.team);

    const plan = await prisma.businessPlan.upsert({
      where: { startupId },
      create: {
        startupId,
        team: teamJson
      },
      update: {
        team: teamJson
      }
    });

    return NextResponse.json({ team: JSON.parse(plan.team || "[]") });

  } catch (error) {
    console.error("API Team Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
