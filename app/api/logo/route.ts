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

    if (startupRecord.logoUrl) {
       // Using logoUrl here as the raw SVG string or a URL.
       return NextResponse.json({ svg: startupRecord.logoUrl });
    }

    const { businessName, description } = startupRecord;

    const prompt = `
You are an expert logo designer and frontend developer.
Generate an elegant, scalable, vector graphic SVG logo for a startup named "${businessName}".
Startup Context: ${description}

Style rules: 
- ViewBox: 0 0 400 400
- Must be a modern, clean, abstract geometric or icon-based logo.
- Use a nice gradient (e.g. from blue-400 to purple-500)
- The SVG must be completely self-contained with no external CSS dependencies.
- Make it aesthetically pleasing.

Return ONLY the raw <svg>...</svg> XML markup. No explanation, no markdown ticks (\`\`\`svg), just the pure HTML element.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
    });

    let svg = completion.choices[0].message.content || "";
    // Clean up
    svg = svg.replace(/```svg/gi, "").replace(/```xml/gi, "").replace(/```/g, "").trim();

    // Basic validation
    if (!svg.startsWith("<svg") || !svg.endsWith("</svg>")) {
         svg = `
         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
           <rect width="100" height="100" rx="20" fill="#3b82f6" />
           <text x="50" y="55" font-family="sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">
             ${businessName.charAt(0).toUpperCase()}
           </text>
         </svg>
         `;
    }

    const updated = await prisma.startup.update({
      where: { id: startupId },
      data: { logoUrl: svg }
    });

    return NextResponse.json({ svg: updated.logoUrl });

  } catch (error) {
    console.error("API Logo Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
