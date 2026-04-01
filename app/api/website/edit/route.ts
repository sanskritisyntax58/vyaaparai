import { NextResponse } from "next/server";
import OpenAI from "openai";
import { prisma } from "@/lib/prisma";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { startupId, instruction } = await req.json();

    if (!startupId || !instruction) {
      return NextResponse.json({ error: "Missing startupId or instruction" }, { status: 400 });
    }

    const website = await prisma.website.findUnique({
      where: { startupId }
    });

    if (!website) {
      return NextResponse.json({ error: "Website not found. Generate one first." }, { status: 404 });
    }

    const prompt = `
    You are an expert web designer. 
    You are given the current HTML of a startup landing page and a specific instruction for modification.
    
    Current HTML:
    ${website.html.substring(0, 5000)} // Truncate if too long to avoid token limits

    Instruction: "${instruction}"

    Modify the HTML to fulfill the instruction. 
    - Maintain the overall structure.
    - Keep using Tailwind CSS (CDN is already included).
    - Return ONLY the full updated raw HTML code. 
    - No markdown formatting, just the raw HTML.
    - If the request is like "add dark mode toggle", implement it with functional JS if possible or just update the styles.
    `;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    let updatedHtml = completion.choices[0].message.content || "";
    updatedHtml = updatedHtml.replace(/```html/gi, "").replace(/```/g, "").trim();

    if (!updatedHtml || updatedHtml.length < 50) {
       return NextResponse.json({ error: "Edit failed. AI returned empty content." }, { status: 500 });
    }

    // Update the database
    const updatedWebsite = await prisma.website.update({
      where: { startupId },
      data: { html: updatedHtml }
    });

    return NextResponse.json({ html: updatedWebsite.html });

  } catch (error) {
    console.error("API Website Edit Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
