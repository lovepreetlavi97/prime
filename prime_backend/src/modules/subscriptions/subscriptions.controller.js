import subscriptionsService from './subscriptions.service.js';
import User from '../../models/User.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { invalidateCachePattern } from '../../middlewares/cacheMiddleware.js';

class SubscriptionsController {
  
  // USER: Create Razorpay Order
  async createOrder(request, reply) {
    const { packageId } = request.body;
    const userId = request.user.id;

    // 1. Get package details
    const packages = await subscriptionsService.listPackages(false);
    const pkg = packages.find(p => p._id.toString() === packageId) || packages[0]; // Fallback to first pkg for testing
    
    if (!pkg) {
      console.error(`❌ Package Not Found: ${packageId}. Available: ${packages.map(p => p._id).join(', ')}`);
      return reply.code(404).send({ error: 'Package not found' });
    }

    // 2. Initialize Razorpay
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    // 3. Create Order
    const options = {
      amount: pkg.price * 100, // Amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    try {
      console.log(`📦 Attempting Order: Pkg: ${pkg.name} | Amount: ${options.amount} | Key: ${process.env.RAZORPAY_KEY_ID}`);
      const order = await instance.orders.create(options);
      return { success: true, order, pkg };
    } catch (err) {
      console.error('❌ Razorpay Order Deep Error:', JSON.stringify(err, null, 2));
      return reply.code(500).send({ 
        error: 'Failed to create payment order', 
        details: err.error?.description || err.message 
      });
    }
  }

  // USER: Verify Razorpay Payment
  async verifyPayment(request, reply) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, packageId } = request.body;
    const userId = request.user.id;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // 🏦 Payment Verified! Update DB.
      const updatedUser = await subscriptionsService.buyPackage(userId, packageId, {
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature
      });
      return { success: true, message: "Payment verified successfully", user: updatedUser };
    } else {
      return reply.code(400).send({ error: "Invalid payment signature" });
    }
  }

  // Admin handlers
  async getPackagesAdmin(request, reply) {
    const packages = await subscriptionsService.listPackages(true);
    return packages;
  }

  async createPackage(request, reply) {
    const pkg = await subscriptionsService.createPackage(request.body);
    await invalidateCachePattern('*packages*');
    return pkg;
  }

  async deletePackage(request, reply) {
    const { id } = request.params;
    await subscriptionsService.deletePackage(id);
    await invalidateCachePattern('*packages*');
    return { status: 'ok', message: 'Package deleted' };
  }

  async updatePackage(request, reply) {
    const { id } = request.params;
    const pkg = await subscriptionsService.updatePackage(id, request.body);
    await invalidateCachePattern('*packages*');
    return pkg;
  }

  // Public: List Packages
  async getPackages(request, reply) {
    const packages = await subscriptionsService.listPackages(false);
    return packages;
  }

  // USER: Get subscription history
  async getUserSubscriptions(request, reply) {
    const userId = request.user.id;
    const history = await subscriptionsService.getUserSubscriptions(userId);
    return history;
  }
}

export default new SubscriptionsController();
