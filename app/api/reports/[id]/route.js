import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function GET(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Await params per Next.js 15 standard
    const { id } = await params;

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) {
      return new Response("User not found", { status: 404 });
    }

    // Fetch report and verify user ownership to prevent IDOR
    const report = await db.report.findUnique({
      where: {
        id,
      },
    });

    if (!report) {
      return new Response("Report not found", { status: 404 });
    }

    if (report.userId !== user.id) {
      return new Response("Unauthorized access", { status: 403 });
    }

    // Decode base64 PDF stream back to binary buffer
    const pdfBuffer = Buffer.from(report.pdfData, "base64");

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${report.name.replace(/[^a-zA-Z0-9-_. ]/g, "_")}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Failed to download PDF report:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
