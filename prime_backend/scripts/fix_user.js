import mongoose from 'mongoose';
import 'dotenv/config';
import User from '../src/models/User.js';

async function fixUser() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + 1);
  
  const result = await User.updateOne(
    { name: 'lavi' },
    { 
      $set: { 
        role: 'ADMIN', 
        'subscription.endDate': futureDate,
        'subscription.isActive': true,
        'subscription.plan': 'Elite'
      } 
    }
  );
  
  console.log('User updated:', result);
  process.exit(0);
}

fixUser();
