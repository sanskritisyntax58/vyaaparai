import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const startups = await prisma.startup.findMany({
      orderBy: { createdAt: "desc" },
      take: 20, // get the latest 20
      include: {
        website: true,
        businessPlan: true
      }
    });

    return NextResponse.json(startups);
  } catch (error) {
    console.error("API History Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
