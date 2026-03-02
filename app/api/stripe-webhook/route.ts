import { NextApiRequest, NextApiResponse } from 'next';
import fetch from 'node-fetch';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        const body = req.body;

        // Validate the webhook payload from Stripe
        const event = body;

        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;

            // Prepare the data for ShipStation
            const orderData = {
                orderNumber: session.id,
                items: session.display_items,
                // Add more fields as needed
            };

            // Send the order data to ShipStation
            try {
                const response = await fetch('https://ssapi.shipstation.com/orders/createorder', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Basic ${Buffer.from('YOUR_API_KEY:YOUR_API_SECRET').toString('base64')}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(orderData),
                });

                if (!response.ok) {
                    throw new Error('Failed to create order in ShipStation');
                }

                res.status(200).json({ success: true });
            } catch (error) {
                res.status(500).json({ error: error.message });
            }
        } else {
            res.status(400).json({ error: 'Unhandled event type' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}