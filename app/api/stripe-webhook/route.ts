import Stripe from "stripe";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
});

function env(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  const webhookSecret = env("STRIPE_WEBHOOK_SECRET");
  const shipKey = env("SHIPSTATION_API_KEY");
  const shipSecret = env("SHIPSTATION_API_SECRET");

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (e: unknown) {
    return NextResponse.json({ error: `Bad signature: ${e instanceof Error ? e.message : String(e)}` }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object as Stripe.PaymentIntent;

    const ship = pi.shipping;
    const addr = ship?.address;

    const name = ship?.name || pi.metadata?.shipName || "";

    const email = pi.receipt_email || (pi.metadata?.email as string | undefined) || "";

    const phone = ship?.phone || (pi.metadata?.phone as string | undefined) || "";

    const street1 = addr?.line1 || (pi.metadata?.shipStreet1 as string | undefined) || "";

    const street2 = addr?.line2 || (pi.metadata?.shipStreet2 as string | undefined) || "";

    const city = addr?.city || (pi.metadata?.shipCity as string | undefined) || "";

    const state = addr?.state || (pi.metadata?.shipState as string | undefined) || "";

    const postalCode = addr?.postal_code || (pi.metadata?.shipPostalCode as string | undefined) || "";

    const country = addr?.country || (pi.metadata?.shipCountry as string | undefined) || "US";

    if (!name || !email || !street1 || !city || !state || !postalCode) {
      return NextResponse.json(
        {
          error:
            "Missing required ship fields (name/email/address). Ensure Stripe Elements is collecting shipping + receipt_email.",
        },
        { status: 400 }
      );
    }

    const qty = Number(pi.metadata?.quantity || 1);
    const productName = (pi.metadata?.product_name as string | undefined) || pi.description || "Item";
    const sku = (pi.metadata?.sku as string | undefined) || "";

    const orderNumber = (pi.metadata?.orderNumber as string | undefined) || `NWS-${pi.id}`;

    const shipstationOrder: Record<string, unknown> = {
      orderNumber,
      orderDate: new Date().toISOString(),
      orderStatus: "awaiting_shipment",
      customerEmail: email,
      billTo: { name, email },
      shipTo: {
        name,
        street1,
        street2,
        city,
        state,
        postalCode,
        country,
        phone,
      },
      notes: `Stripe PI: ${pi.id}`,
      internalNotes: `Charge: ${pi.latest_charge ?? ""}`,
      amountPaid: typeof pi.amount_received === "number" ? pi.amount_received / 100 : undefined,
      items: [
        {
          name: productName,
          sku,
          quantity: qty,
          unitPrice: pi.metadata?.subtotal_cents
            ? Number(pi.metadata.subtotal_cents) / 100 / (qty || 1)
            : undefined,
        },
      ],
    };

    const auth = "Basic " + Buffer.from(`${shipKey}:${shipSecret}`).toString("base64");

    const ssRes = await fetch("https://ssapi.shipstation.com/orders/createorder", {
      method: "POST",
      headers: { Authorization: auth, "Content-Type": "application/json" },
      body: JSON.stringify(shipstationOrder),
    });

    if (!ssRes.ok) {
      const text = await ssRes.text().catch(() => "");
      return NextResponse.json(
        { error: "ShipStation createorder failed", status: ssRes.status, details: text },
        { status: 500 }
      );
    }
  }

  return NextResponse.json({ received: true });
}