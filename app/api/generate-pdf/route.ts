import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

const firestore = admin.firestore();

export async function GET() {
  try {
    // Fetch data from Firestore
    const snapshot = await firestore.collection("users").get();
    const users = snapshot.docs.map((doc) => doc.data());

    // Create PDF document
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 750]);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { width, height } = page.getSize();

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontSize = 12;

    // Title
    page.drawText("User Report", {
      x: 50,
      y: height - 50,
      size: 24,
      font,
      color: rgb(0, 0, 0),
    });

    // Table headers
    const tableTop = height - 100;
    const col1X = 50;
    const col2X = 200;
    const col3X = 400;
    const rowHeight = 20;

    page.drawText("Name", { x: col1X, y: tableTop, size: fontSize, font });
    page.drawText("Email", { x: col2X, y: tableTop, size: fontSize, font });
    page.drawText("City", { x: col3X, y: tableTop, size: fontSize, font });

    // Table rows with data
    let y = tableTop - rowHeight;
    users.forEach((user: any) => {
      page.drawText(user.name || "-", { x: col1X, y, size: fontSize, font });
      page.drawText(user.email || "-", { x: col2X, y, size: fontSize, font });
      page.drawText(user.city || "-", { x: col3X, y, size: fontSize, font });
      y -= rowHeight;
    });

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=report.pdf",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
