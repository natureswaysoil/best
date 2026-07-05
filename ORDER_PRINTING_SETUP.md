# Nature's Way Soil Order Email + Packing Slip Printing Setup

This repo is now wired so paid Stripe Checkout orders can:

1. collect the customer's shipping address and phone number in Stripe Checkout,
2. send Nature's Way Soil an internal new-order email,
3. send the customer an order confirmation email,
4. generate a printable packing slip / shipping invoice, and
5. allow a printer-connected computer to poll for new paid orders and print packing slips automatically.

## 1. Required Vercel environment variables

Set these in Vercel for the production site:

```bash
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=https://natureswaysoil.com
PRINT_QUEUE_SECRET=make-a-long-random-password
PRINT_SLIP_TOKEN=make-a-long-random-password
```

`PRINT_QUEUE_SECRET` is used by the local printer computer to ask the site for paid orders. `PRINT_SLIP_TOKEN` protects packing slip URLs. They can be the same value, but two different long values is better.

Supabase is optional for the print flow, but if you want paid orders saved there too, also set:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 2. Stripe webhook setup

In Stripe Dashboard, add a webhook endpoint:

```text
https://natureswaysoil.com/api/webhooks/stripe
```

Subscribe it to this event:

```text
checkout.session.completed
```

Copy the webhook signing secret from Stripe and put it into Vercel as:

```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 3. What the website does after payment

After a customer pays, Stripe sends `checkout.session.completed` to the webhook. The webhook then:

- pulls the completed Stripe Checkout Session,
- reads the customer email, name, shipping address, phone, product, SKU, quantity, and total,
- sends an internal email to the Nature's Way Soil addresses in `pages/api/webhooks/stripe.ts`,
- includes a printable packing slip link,
- sends a customer order confirmation email, and
- saves the order to Supabase when Supabase is configured.

The printable packing slip URL format is:

```text
/api/packing-slip/<stripe_checkout_session_id>?token=<PRINT_SLIP_TOKEN>
```

## 4. Local printer computer setup

On the computer connected to your shipping printer:

1. Install Node.js 20 or newer.
2. Install Google Chrome.
3. Clone or download this repo.
4. In the repo folder, run:

```bash
npm install
```

Then start the printer agent.

### Windows PowerShell

```powershell
$env:NWS_SITE_URL="https://natureswaysoil.com"
$env:PRINT_QUEUE_SECRET="the-same-secret-from-vercel"
npm run print:orders
```

Leave that PowerShell window open. The script checks for new paid Stripe orders about once per minute.

### Optional Windows Chrome path

If Chrome is not found automatically:

```powershell
$env:CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
```

## 5. How automatic printing works

The local script calls:

```text
https://natureswaysoil.com/api/print-queue?secret=<PRINT_QUEUE_SECRET>
```

The website returns recent paid Stripe Checkout Sessions and a protected packing slip URL for each one. The local script remembers which Stripe session IDs it already printed in:

```text
.printed-orders.json
```

Then it downloads the packing slip HTML and opens it in Chrome with kiosk printing enabled.

## 6. Test checklist

Before relying on it for real orders:

1. Make a small test product/order in Stripe test mode or use a coupon/test payment.
2. Confirm the Stripe webhook shows a successful `checkout.session.completed` delivery.
3. Confirm Nature's Way Soil receives the internal order email.
4. Open the packing slip link in the email and confirm it displays the shipping address.
5. Start the printer script on the printer-connected computer.
6. Place another test order and confirm the packing slip prints.

## 7. Important note

A website cannot directly force your local printer to print by itself. The printer-connected computer must run the local polling script. That local script is what bridges the live website to your physical printer.
