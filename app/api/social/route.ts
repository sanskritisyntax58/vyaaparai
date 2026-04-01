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
    });

    if (!startupRecord) {
      return NextResponse.json({ error: "Startup not found" }, { status: 404 });
    }

    const { businessName, tagline, description } = startupRecord;

    const prompt = `
    You are a viral social media marketing expert. 
    Generate a high-growth Social Media Launch Kit for a new startup:
    Name: ${businessName}
    Tagline: ${tagline}
    Description: ${description}

    Return JSON exactly like this:
    {
      "linkedin": "A long-form, professional yet exciting LinkedIn post with emojis and hashtags.",
      "twitter": "A 3-5 tweet thread that captures attention, explains the problem/solution, and has a call to action.",
      "instagram": "A catchy, short caption for an announcement post."
    }
    `;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.8,
    });

    let text = completion.choices[0].message.content || "";
    // Clean markdown JSON formatting if the model wraps it
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();

    try {
      const result = JSON.parse(text);
      return NextResponse.json(result);
    } catch (e) {
      console.error("JSON Parse Error In Social API:", text);
      return NextResponse.json({
        linkedin: "Exciting news! We are launching " + businessName + ". " + tagline,
        twitter: "1/ 🚀 Big news! Introducing " + businessName + ". \n\n" + tagline,
        instagram: "The future of " + businessName + " is here. 🚀"
      });
    }

  } catch (error) {
    console.error("API Social Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
