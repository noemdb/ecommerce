import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  // Este token debe coincidir con el configurado en Meta For Developers
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  } else {
    return new NextResponse("Forbidden", { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Aquí procesamos los acuses de recibo (status) o mensajes entrantes
    if (body.object) {
      if (
        body.entry &&
        body.entry[0].changes &&
        body.entry[0].changes[0] &&
        body.entry[0].changes[0].value.statuses
      ) {
        const status = body.entry[0].changes[0].value.statuses[0];
        console.log(`[WHATSAPP_STATUS] Msg ID: ${status.id} is now ${status.status}`);
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("[WHATSAPP_WEBHOOK_ERROR]", error);
    return new NextResponse("Server Error", { status: 500 });
  }
}
