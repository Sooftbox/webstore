import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendProductDeliveryEmail(
  to: string,
  buyerName: string,
  productName: string,
  deliveryContent: string,
  storeName: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { margin: 0; padding: 0; background: #0a0a0a; color: #f5f5f5; font-family: 'Segoe UI', Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; background: #111111; border-radius: 16px; overflow: hidden; border: 1px solid #2a2a2a; }
        .header { background: linear-gradient(135deg, #1a1a1a, #0a0a0a); padding: 40px 32px; text-align: center; border-bottom: 1px solid #c8a84e; }
        .header h1 { color: #c8a84e; font-size: 28px; margin: 0; letter-spacing: 2px; }
        .body { padding: 32px; }
        .body h2 { color: #f5f5f5; font-size: 22px; margin-bottom: 8px; }
        .body p { color: #a0a0a0; line-height: 1.7; font-size: 15px; }
        .product-box { background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px; margin: 24px 0; }
        .product-box h3 { color: #c8a84e; margin: 0 0 8px 0; font-size: 18px; }
        .delivery-content { background: #0a0a0a; border: 1px dashed #c8a84e; border-radius: 8px; padding: 20px; margin: 16px 0; word-break: break-all; }
        .delivery-content p { color: #f5f5f5; font-size: 14px; margin: 0; font-family: monospace; white-space: pre-wrap; }
        .footer { padding: 24px 32px; text-align: center; border-top: 1px solid #2a2a2a; }
        .footer p { color: #666; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div style="padding: 20px; background: #0a0a0a;">
        <div class="container">
          <div class="header">
            <h1>✦ ${storeName} ✦</h1>
          </div>
          <div class="body">
            <h2>Payment Confirmed! 🎉</h2>
            <p>Hey ${buyerName}, your payment has been verified and confirmed.</p>
            
            <div class="product-box">
              <h3>📦 ${productName}</h3>
              <p style="color: #a0a0a0; margin: 0;">Here's your product:</p>
              <div class="delivery-content">
                <p>${deliveryContent}</p>
              </div>
            </div>

            <p>If you have any issues, feel free to reach out to us via Discord or email.</p>
            <p style="color: #c8a84e;">Thank you for your purchase! 🙏</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${storeName}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  await transporter.sendMail({
    from: `"${storeName}" <${process.env.EMAIL_USER}>`,
    to,
    subject: `✅ Order Confirmed - ${productName} | ${storeName}`,
    html,
  })
}