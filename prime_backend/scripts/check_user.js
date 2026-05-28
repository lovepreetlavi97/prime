import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../src/models/User.js';

async function checkUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const user = await User.findOne({ name: 'lavi' });
  if (user) {
    console.log(`User: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log(`Subscription:`, JSON.stringify(user.subscription, null, 2));
    const now = new Date();
    const isPro = user?.role === 'ADMIN' || (
      user?.subscription?.plan && 
      user?.subscription?.plan !== 'free' && 
      user?.subscription?.isActive && 
      (!user?.subscription?.endDate || new Date(user.subscription.endDate) > now)
    );
    console.log(`IsPro calculated: ${isPro}`);
  }
  
  process.exit(0);
}

checkUser();
