import { NextResponse } from "next/server";
import { extractText } from "unpdf";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          error: "Please upload a PDF file.",
        },
        { status: 400 }
      );
    }
    if (
      file.type !== "application/pdf" &&
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Only PDF files are supported.",
        },
        { status: 400 }
      );
    }
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          error: "PDF must be smaller than 10MB.",
        },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text, totalPages } = await extractText(
      new Uint8Array(buffer)
    );
    const extractedText = text
      .join("\n\n")
      .replace(/\r/g, "")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    if (!extractedText) {
      return NextResponse.json(
        {
          success: false,
          error: "No readable text was found in this PDF.",
        },
        { status: 400 }
      );
    }
    return NextResponse.json({
      success: true,
      document: {
        filename: file.name,
        size: file.size,
        pages: totalPages,
        text: extractedText,
      },
    });
  } catch (error) {
    console.error("SOW PDF extraction error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "The PDF could not be processed. Please try another PDF.",
      },
      { status: 500 }
    );
  }
}
