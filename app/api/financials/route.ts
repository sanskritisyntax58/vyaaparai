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

    if (startupRecord.businessPlan?.financials) {
       return NextResponse.json({ financials: JSON.parse(startupRecord.businessPlan.financials) });
    }

    const { businessName, tagline, description } = startupRecord;

    const prompt = `
Generate a structured 12-month financial projection for a startup called ${businessName}.
Tagline: ${tagline}
Description: ${description}

Return a 12-month projection of Revenue, Operating Expenses, and Net Profit.
Return JSON exactly in this format:
{
  "currency": "USD",
  "monthlyData": [
    {
      "month": "Month 1",
      "revenue": 1000,
      "expenses": 2000,
      "profit": -1000
    },
    ... (total 12 months)
  ],
  "summary": {
    "totalRevenueYear1": 50000,
    "totalExpensesYear1": 30000,
    "netProfitYear1": 20000,
    "breakEvenMonth": 6
  }
}

The projections should reflect a realistic growth curve for the startup's niche.
`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a professional CFO for tech startups. Always respond ONLY with valid JSON." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    });

    let text = completion.choices[0].message.content || "";
    text = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    
    const parsed = JSON.parse(text);
    const financialsJson = JSON.stringify(parsed);

    const plan = await prisma.businessPlan.upsert({
      where: { startupId },
      create: {
        startupId,
        financials: financialsJson
      },
      update: {
        financials: financialsJson
      }
    });

    return NextResponse.json({ financials: JSON.parse(plan.financials || "{}") });

  } catch (error) {
    console.error("API Financials Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
