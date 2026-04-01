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

    if (startupRecord.businessPlan?.mockups) {
       return NextResponse.json({ mockups: JSON.parse(startupRecord.businessPlan.mockups) });
    }

    const { businessName, tagline, description } = startupRecord;

    const prompt = `
Generate a list of 3 professional product mockup descriptions for ${businessName}.
Tagline: ${tagline}
Description: ${description}

Return JSON exactly in this format:
{
  "mockups": [
    {
      "title": "Main Dashboard",
      "description": "A high-fidelity dashboard showing key startup metrics.",
      "imagePrompt": "A professional UI/UX design of a tech startup dashboard, clean minimalist dark mode, vibrant accents, highly detailed, 4k.",
      "url": "/mockups/default.png"
    }
    // ... total 3
  ]
}
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a professional product designer. Always respond ONLY with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    });

    let text = completion.choices[0].message.content || "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);
    const mockupsJson = JSON.stringify(parsed.mockups);

    const plan = await prisma.businessPlan.upsert({
      where: { startupId },
      create: {
        startupId,
        mockups: mockupsJson
      },
      update: {
        mockups: mockupsJson
      }
    });

    return NextResponse.json({ mockups: JSON.parse(plan.mockups || "[]") });

  } catch (error) {
    console.error("API Mockups Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
