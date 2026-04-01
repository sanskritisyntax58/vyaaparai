import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const startups = await prisma.startup.findMany({
      orderBy: [
        { isFavorite: "desc" },
        { createdAt: "desc" }
      ] as any,
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

export async function DELETE(request: Request) {
  try {
    const { id, clearAll } = await request.json();
    
    if (clearAll) {
      await prisma.startup.deleteMany({});
      return NextResponse.json({ success: true, cleared: true });
    }

    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    
    await prisma.startup.delete({
      where: { id }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Delete Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
