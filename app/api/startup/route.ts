import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const { id, businessName, tagline, isFavorite } = await request.json();
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

    const updateData: any = {};
    if (businessName !== undefined) updateData.businessName = businessName;
    if (tagline !== undefined) updateData.tagline = tagline;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const startup = await prisma.startup.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, startup });
  } catch (error) {
    console.error("API Startup Update Error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
