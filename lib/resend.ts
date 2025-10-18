import { Resend } from 'resend';

// CRITICAL: This module must ONLY be imported in server-side code (API routes, getServerSideProps, etc.)
// Never import this in client components or pages that run in the browser

let resend: Resend | null = null;

function getResendClient(): Resend | null {
  // Ensure this only runs on server-side
  if (typeof window !== 'undefined') {
    console.error('[resend_client] ERROR: Attempted to initialize Resend on client-side. This is a security risk!');
    return null;
  }
  
  if (!process.env.RESEND_API_KEY) {
    console.warn('[resend_client] RESEND_API_KEY not configured');
    return null;
  }
  
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  
  return resend;
}

export interface EmailTemplate {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

// Order confirmation email
export async function sendOrderConfirmation(
  email: string, 
  orderDetails: {
    orderId: string;
    name: string;
    items: Array<{ title: string; size?: string; qty: number; price: number; sku: string }>;
    subtotal: number;
    tax?: number;
    shipping?: number;
    total: number;
    shippingAddress?: {
      address1?: string;
      address2?: string;
      city?: string;
      state?: string;
      zip?: string;
    };
  }
) {
  const client = getResendClient();
  if (!client) {
    console.log('[email:mock] sendOrderConfirmation', { email, orderId: orderDetails.orderId });
    return { success: false, error: 'Email service not configured' };
  }
  
  const { orderId, name, items, subtotal, tax = 0, shipping = 0, total, shippingAddress } = orderDetails;
  
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">
        ${item.title}${item.size ? ` - ${item.size}` : ''}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">
        ${item.qty}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">
        $${item.price.toFixed(2)}
      </td>
    </tr>
  `).join('');

  const shippingHtml = shippingAddress ? `
    <div style="margin-top: 20px;">
      <h3 style="color: #2d5016;">Shipping Address:</h3>
      <p>
        ${shippingAddress.address1}<br>
        ${shippingAddress.address2 ? `${shippingAddress.address2}<br>` : ''}
        ${shippingAddress.city}, ${shippingAddress.state} ${shippingAddress.zip}
      </p>
    </div>
  ` : '';
  
  try {
    const { data, error } = await client.emails.send({
      from: process.env.RESEND_FROM || 'Nature\'s Way Soil <orders@natureswaysoil.com>',
      to: email,
      subject: `Order Confirmation #${orderId}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th { background: #f8f9fa; padding: 12px; text-align: left; border-bottom: 2px solid #ddd; }
              .total-row { font-weight: bold; border-top: 2px solid #2d5016; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Thank You for Your Order!</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>Your order has been confirmed and will be processed shortly.</p>
                
                <p><strong>Order ID:</strong> ${orderId}</p>
                
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style="text-align: center;">Qty</th>
                      <th style="text-align: right;">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                    <tr>
                      <td colspan="2" style="padding: 8px; text-align: right;"><strong>Subtotal:</strong></td>
                      <td style="padding: 8px; text-align: right;"><strong>$${subtotal.toFixed(2)}</strong></td>
                    </tr>
                    ${shipping > 0 ? `
                    <tr>
                      <td colspan="2" style="padding: 8px; text-align: right;"><strong>Shipping:</strong></td>
                      <td style="padding: 8px; text-align: right;"><strong>$${shipping.toFixed(2)}</strong></td>
                    </tr>
                    ` : ''}
                    ${tax > 0 ? `
                    <tr>
                      <td colspan="2" style="padding: 8px; text-align: right;"><strong>Tax:</strong></td>
                      <td style="padding: 8px; text-align: right;"><strong>$${tax.toFixed(2)}</strong></td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                      <td colspan="2" style="padding: 12px; text-align: right; font-size: 18px;"><strong>Total:</strong></td>
                      <td style="padding: 12px; text-align: right; font-size: 18px;"><strong>$${total.toFixed(2)}</strong></td>
                    </tr>
                  </tbody>
                </table>
                
                ${shippingHtml}
                
                <p style="margin-top: 30px;">
                  <a href="https://natureswaysoil.com" style="background-color: #2d5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Visit Our Store</a>
                </p>
              </div>
              <div class="footer">
                <p>Questions? Reply to this email or contact support@natureswaysoil.com</p>
                <p>Nature's Way Soil - Naturally Stronger Soil Starts Here</p>
              </div>
            </div>
          </body>
        </html>
      `
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error sending order confirmation:', error);
    return { success: false, error };
  }
}

// Welcome email for new subscribers  
export async function sendWelcomeEmail(email: string, firstName?: string) {
  const client = getResendClient();
  if (!client) {
    console.log('[email:mock] sendWelcomeEmail', { email, firstName });
    return { success: false, error: 'Email service not configured' };
  }
  
  const name = firstName || 'Friend';
  
  try {
    const { data, error } = await client.emails.send({
      from: process.env.RESEND_FROM || 'Nature\'s Way Soil <hello@natureswaysoil.com>',
      to: email,
      subject: 'Welcome to Nature\'s Way Soil - Your Journey to Healthier Soil Starts Here',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Welcome, ${name}!</h1>
              </div>
              <div class="content">
                <p>Thank you for joining the Nature's Way Soil community. We're excited to help you discover the power of organic soil health.</p>
                
                <h2 style="color: #2d5016;">Why Organic Matters</h2>
                <p>Did you know that synthetic fertilizers can disrupt the natural symbiotic relationships between plants and beneficial soil fungi? Our organic fertilizers work with nature, not against it.</p>
                
                <h2 style="color: #2d5016;">Get Started</h2>
                <ul>
                  <li>Browse our <a href="https://natureswaysoil.com/shop">product collection</a></li>
                  <li>Learn about soil health on our blog</li>
                  <li>Get personalized recommendations from our chat assistant</li>
                </ul>
                
                <p style="margin-top: 30px;">
                  <a href="https://natureswaysoil.com/shop" style="background-color: #2d5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Shop Now</a>
                </p>
                
                <p style="color: #666; font-size: 12px; margin-top: 40px;">
                  You're receiving this email because you signed up at natureswaysoil.com
                </p>
              </div>
            </div>
          </body>
        </html>
      `
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error };
  }
}

// Follow-up email for a few days later
export async function sendFollowUpEmail(email: string, name: string) {
  const client = getResendClient();
  if (!client) {
    console.log('[email:mock] sendFollowUpEmail', { email, name });
    return { success: false, error: 'Email service not configured' };
  }
  
  try {
    const { data, error } = await client.emails.send({
      from: process.env.RESEND_FROM || 'Nature\'s Way Soil <hello@natureswaysoil.com>',
      to: email,
      subject: 'How\'s Your Soil Health Journey Going?',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #2d5016; color: white; padding: 20px; text-align: center; }
              .content { padding: 20px; }
              .footer { background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #666; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>How's It Growing, ${name}?</h1>
              </div>
              <div class="content">
                <p>Hi ${name},</p>
                <p>It's been a few days since your order, and we wanted to check in on your soil health journey!</p>
                
                <h2 style="color: #2d5016;">Getting the Most from Your Products</h2>
                <p>Here are some tips to maximize your results:</p>
                <ul>
                  <li><strong>Timing:</strong> Early morning or evening applications work best</li>
                  <li><strong>Watering:</strong> Light watering after application helps absorption</li>
                  <li><strong>Consistency:</strong> Regular applications yield the best results</li>
                </ul>
                
                <h2 style="color: #2d5016;">Need Help?</h2>
                <p>Our team is here to support your success. Whether you have questions about application, dosage, or seeing results, we're just an email away.</p>
                
                <p style="margin-top: 30px;">
                  <a href="mailto:support@natureswaysoil.com" style="background-color: #2d5016; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Contact Support</a>
                </p>
                
                <p><strong>P.S.</strong> Share your before/after photos with us - we love seeing the transformation!</p>
              </div>
              <div class="footer">
                <p>Questions? Reply to this email or contact support@natureswaysoil.com</p>
                <p>Nature's Way Soil - Naturally Stronger Soil Starts Here</p>
              </div>
            </div>
          </body>
        </html>
      `
    });
    
    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error sending follow-up email:', error);
    return { success: false, error };
  }
}