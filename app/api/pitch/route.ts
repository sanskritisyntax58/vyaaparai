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

    const { businessName, tagline, description } = startupRecord;

    const prompt = `
Generate a compelling 60-second elevator pitch transcript for a startup called ${businessName}.
Tagline: ${tagline}
Description: ${description}

The transcript should be professional, energetic, and structured as a spoken pitch.
Include a hook, the problem, the solution, and a call to action.
Keep it between 120-150 words (approximately 60 seconds of speaking time).
Do not include any speaker notes or bracketed text. Just the spoken words.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a professional startup pitch coach. Write persuasive and natural sounding pitch transcripts." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    const transcript = completion.choices[0].message.content?.trim() || "";

    // Save to the startup record
    const updated = await prisma.startup.update({
      where: { id: startupId },
      data: {
        elevatorPitch: transcript
      }
    });

    return NextResponse.json({ transcript: updated.elevatorPitch });

  } catch (error) {
    console.error("API Pitch Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
