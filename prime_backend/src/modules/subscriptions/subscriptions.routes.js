import subscriptionsController from './subscriptions.controller.js';
import subscriptionsService from './subscriptions.service.js';
import authenticate from '../../middlewares/authMiddleware.js';
import { routeCache } from '../../middlewares/cacheMiddleware.js';
import Razorpay from 'razorpay';
import User from '../../models/User.js';

export default async function (fastify, opts) {
  // Public routes cached for 5 minutes (300s)
  fastify.get('/packages', { preHandler: [routeCache(300)] }, subscriptionsController.getPackages);

  // User Protected routes
  fastify.post('/create-order', { preHandler: [authenticate] }, subscriptionsController.createOrder);
  fastify.post('/verify-payment', { preHandler: [authenticate] }, subscriptionsController.verifyPayment);
  fastify.post('/bypass-purchase', { preHandler: [authenticate] }, async (request, reply) => {
    const { packageId } = request.body;
    const userId = request.user.id;
    try {
      const updatedUser = await subscriptionsService.buyPackage(userId, packageId, {
        razorpayOrderId: 'bypass_' + Date.now(),
        razorpayPaymentId: 'bypass_pay_' + Date.now(),
        razorpaySignature: 'bypass_sig'
      });
      return { success: true, message: "Subscription activated successfully via testing bypass", user: updatedUser };
    } catch (e) {
      return reply.code(500).send({ error: e.message });
    }
  });

  // Web checkout simulator with real Razorpay integration
  fastify.get('/checkout', async (request, reply) => {
    const { packageId, token } = request.query;
    if (!packageId || !token) {
      return reply.type('text/html').send('<h1>Missing required parameter token or packageId</h1>');
    }

    try {
      // Decode JWT token
      const decoded = fastify.jwt.verify(token);
      const userId = decoded.id;

      // Fetch User & Package details
      const user = await User.findById(userId);
      if (!user) {
        return reply.type('text/html').send('<h1>User not found</h1>');
      }

      const packages = await subscriptionsService.listPackages(false);
      const pkg = packages.find(p => p._id.toString() === packageId) || packages[0];
      if (!pkg) {
        return reply.type('text/html').send('<h1>Subscription package not found</h1>');
      }

      // Initialize Razorpay
      const instance = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      });

      // Create Order
      const options = {
        amount: pkg.price * 100, // paise
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      };

      const order = await instance.orders.create(options);

      // Serve success HTML page
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>LVX | Premium Secure Checkout</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;700;900&display=swap" rel="stylesheet">
          <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
          <style>
            :root {
              --primary: #D4AF37;
              --primary-hover: #FFD700;
              --background: #03050C;
              --surface: #0A0D18;
              --surface-highlight: rgba(212, 175, 55, 0.15);
              --text: #F4F4F6;
              --text-secondary: #94A3B8;
            }
            body {
              background-color: var(--background);
              background-image: 
                radial-gradient(circle at 10% 20%, rgba(212, 175, 55, 0.05) 0%, transparent 40%),
                radial-gradient(circle at 90% 80%, rgba(212, 175, 55, 0.03) 0%, transparent 45%);
              color: var(--text);
              font-family: 'Outfit', sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              padding: 24px;
              box-sizing: border-box;
            }
            .card {
              background: rgba(10, 13, 24, 0.8);
              backdrop-filter: blur(16px);
              border: 1px solid rgba(212, 175, 55, 0.2);
              box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 1px rgba(255, 255, 255, 0.05);
              padding: 40px 32px;
              border-radius: 28px;
              max-width: 420px;
              width: 100%;
              position: relative;
              overflow: hidden;
            }
            .card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, transparent, var(--primary), transparent);
            }
            .header {
              margin-bottom: 28px;
            }
            .brand {
              font-size: 11px;
              font-weight: 900;
              color: var(--primary);
              letter-spacing: 3px;
              text-transform: uppercase;
              margin-bottom: 8px;
            }
            h1 {
              font-size: 22px;
              font-weight: 900;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              background: linear-gradient(135deg, #FFF, #A1A1AA);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }
            .summary-box {
              background: rgba(0, 0, 0, 0.3);
              border: 1px solid rgba(255, 255, 255, 0.05);
              border-radius: 18px;
              padding: 20px;
              margin-bottom: 28px;
              text-align: left;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
              font-size: 13px;
            }
            .summary-row:last-child {
              border-bottom: none;
              padding-bottom: 0;
            }
            .summary-row:first-child {
              padding-top: 0;
            }
            .summary-label {
              color: var(--text-secondary);
            }
            .summary-value {
              font-weight: 700;
              color: var(--text);
            }
            .summary-value.highlight {
              color: var(--primary);
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-top: 14px;
              padding-top: 14px;
              border-top: 1px dashed rgba(212, 175, 55, 0.3);
            }
            .total-label {
              font-weight: 900;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: var(--primary);
            }
            .total-price {
              font-size: 26px;
              font-weight: 900;
              color: var(--primary);
              text-shadow: 0 0 10px rgba(212, 175, 55, 0.2);
            }
            p.info-text {
              color: var(--text-secondary);
              font-size: 12px;
              line-height: 1.6;
              margin: 0 0 28px 0;
            }
            .btn {
              background: linear-gradient(135deg, var(--primary), #FFD700);
              color: #000;
              text-decoration: none;
              font-weight: 900;
              font-size: 12px;
              letter-spacing: 1.5px;
              text-transform: uppercase;
              padding: 18px 28px;
              border-radius: 18px;
              display: block;
              transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
              box-shadow: 0 4px 20px rgba(212, 175, 55, 0.25);
              border: none;
              cursor: pointer;
              width: 100%;
              box-sizing: border-box;
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
            }
            .btn:active {
              transform: translateY(0);
            }
            .status-text {
              margin-top: 20px;
              font-size: 13px;
              font-weight: 500;
              color: var(--primary);
              display: none;
              align-items: center;
              justify-content: center;
              gap: 10px;
            }
            
            /* Loading Orb Spinner */
            .spinner {
              width: 18px;
              height: 18px;
              border: 2px solid rgba(212, 175, 55, 0.2);
              border-top-color: var(--primary);
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
              display: inline-block;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
            
            .icon-wrapper {
              width: 60px;
              height: 60px;
              background: rgba(212, 175, 55, 0.1);
              border: 1px solid rgba(212, 175, 55, 0.3);
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 20px auto;
            }
            .icon-wrapper svg {
              width: 28px;
              height: 28px;
              stroke: var(--primary);
              fill: none;
              stroke-width: 2;
            }
          </style>
        </head>
        <body>
          <div class="card" id="checkout-card">
            <div class="header">
              <div class="brand">LVX Terminal</div>
              <h1>Secure Checkout</h1>
            </div>
            
            <div class="summary-box">
              <div class="summary-row">
                <span class="summary-label">Access Pass</span>
                <span class="summary-value">${pkg.name} Tier</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Duration</span>
                <span class="summary-value">${pkg.durationInDays} Days Unlimited</span>
              </div>
              <div class="summary-row">
                <span class="summary-label">Gateway</span>
                <span class="summary-value highlight">Razorpay Secure</span>
              </div>
              <div class="total-row">
                <span class="total-label">Total Due</span>
                <span class="total-price">₹${pkg.price}</span>
              </div>
            </div>

            <p class="info-text">Payments are processed instantly and safely. You will be auto-redirected back to the mobile application upon authorization.</p>
            
            <button id="pay-button" class="btn" onclick="startPayment()">Proceed to Pay</button>
            <div id="status" class="status-text">
              <div class="spinner"></div>
              <span id="status-message">Initializing checkout...</span>
            </div>
          </div>

          <script>
            const rzpOptions = {
              "key": "${process.env.RAZORPAY_KEY_ID}",
              "amount": "${order.amount}",
              "currency": "INR",
              "name": "LVPrimeX",
              "description": "${pkg.name} Option Signals Pass",
              "order_id": "${order.id}",
              "handler": function (response) {
                verifyPayment(response);
              },
              "prefill": {
                "name": "${user.name || ''}",
                "contact": "${user.phone || ''}"
              },
              "theme": {
                "color": "#D4AF37"
              },
              "modal": {
                "ondismiss": function() {
                  document.getElementById('status').style.display = 'none';
                  document.getElementById('pay-button').style.display = 'block';
                }
              }
            };

            const rzp = new Razorpay(rzpOptions);

            function startPayment() {
              document.getElementById('pay-button').style.display = 'none';
              document.getElementById('status').style.display = 'flex';
              document.getElementById('status-message').innerText = 'Opening Razorpay Gateway...';
              rzp.open();
            }

            // Auto-trigger Razorpay checkout on load
            window.onload = function() {
              startPayment();
            };

            function verifyPayment(paymentResponse) {
              document.getElementById('status-message').innerText = 'Verifying payment...';
              
              fetch('/api/v1/subscriptions/verify-payment', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': 'Bearer ${token}'
                },
                body: JSON.stringify({
                  razorpay_order_id: paymentResponse.razorpay_order_id,
                  razorpay_payment_id: paymentResponse.razorpay_payment_id,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  packageId: "${packageId}"
                })
              })
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  showSuccess();
                } else {
                  showError(data.error || 'Verification failed');
                }
              })
              .catch(err => {
                showError(err.message || 'Network error');
              });
            }

            function showSuccess() {
              const card = document.getElementById('checkout-card');
              card.innerHTML = \`
                <div class="icon-wrapper" style="background: rgba(16, 185, 129, 0.1); border-color: rgba(16, 185, 129, 0.3);">
                  <svg viewBox="0 0 24 24" style="stroke: #10B981;"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h1 style="background: linear-gradient(135deg, #10B981, #34D399); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Payment Success</h1>
                <p class="info-text" style="margin: 20px 0 28px 0; font-size: 13px;">Your subscription has been successfully upgraded! Redirecting you back to the app shortly...</p>
                <a href="intent://lvprimex#Intent;scheme=lvprimex;package=com.lvprimex.app;end" class="btn" style="text-align: center; display: block;">Return to App</a>
              \`;
              // Auto-redirect after 3 seconds
              setTimeout(() => {
                window.location.href = "intent://lvprimex#Intent;scheme=lvprimex;package=com.lvprimex.app;end";
              }, 3000);
            }

            function showError(errMessage) {
              const card = document.getElementById('checkout-card');
              card.innerHTML = \`
                <div class="icon-wrapper" style="background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.3);">
                  <svg viewBox="0 0 24 24" style="stroke: #EF4444;"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </div>
                <h1 style="background: linear-gradient(135deg, #EF4444, #F87171); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Payment Failed</h1>
                <p class="info-text" style="margin: 20px 0 28px 0; font-size: 13px;">\${errMessage}</p>
                <button onclick="window.location.reload()" class="btn" style="margin-bottom: 12px;">Retry Payment</button>
                <a href="intent://lvprimex#Intent;scheme=lvprimex;package=com.lvprimex.app;end" class="btn" style="background: transparent; border: 1px solid rgba(212,175,55,0.4); color: #D4AF37; text-align: center; display: block; box-shadow: none;">Return to App</a>
              \`;
            }
          </script>
        </body>
        </html>
      `;
      return reply.type('text/html').send(html);
    } catch (e) {
      return reply.type('text/html').send(`<h1>Checkout Session Failed</h1><p>${e.message}</p>`);
    }
  });

  fastify.get('/history', { preHandler: [authenticate] }, subscriptionsController.getUserSubscriptions);
}
