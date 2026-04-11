import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (process.env.GOV_INVOICE_ADMIN_TOKEN && body.adminToken !== process.env.GOV_INVOICE_ADMIN_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
    }

    const { email, name, amount, description } = body;

    if (!email || !amount) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Create customer
    const customerRes = await fetch('https://api.stripe.com/v1/customers', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ email, name }),
    });
    const customer = await customerRes.json();

    // Create invoice item
    await fetch('https://api.stripe.com/v1/invoiceitems', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customer.id,
        amount: String(Math.round(Number(amount) * 100)),
        currency: 'usd',
        description: description || 'Government order',
      }),
    });

    // Create invoice
    const invoiceRes = await fetch('https://api.stripe.com/v1/invoices', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        customer: customer.id,
        collection_method: 'send_invoice',
        days_until_due: '30',
      }),
    });
    const invoice = await invoiceRes.json();

    // Finalize invoice
    const finalizedRes = await fetch(`https://api.stripe.com/v1/invoices/${invoice.id}/finalize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
      },
    });
    const finalized = await finalizedRes.json();

    return NextResponse.json({ success: true, url: finalized.hosted_invoice_url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
