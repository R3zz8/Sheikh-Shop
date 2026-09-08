import { NextRequest, NextResponse } from "next/server";
import { TipaxClient } from "@/lib/tipax/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ trackingCode: string }> }
) {
  try {
    const { trackingCode } = await params;

    if (!trackingCode || typeof trackingCode !== "string" || !trackingCode.trim()) {
      return NextResponse.json(
        { success: false, error: "کد رهگیری مرسوله وارد نشده است" },
        { status: 400 }
      );
    }

    const trackingResult = await TipaxClient.tracking(trackingCode.trim());

    return NextResponse.json({
      success: true,
      tracking: trackingResult,
    });
  } catch (error: any) {
    console.error("[Tracking API Route Error]", error?.message || error);
    return NextResponse.json(
      {
        success: false,
        error: "خطا در استعلام وضعیّت مرسوله تیپاکس",
      },
      { status: 500 }
    );
  }
}
