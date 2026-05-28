import mongoose from 'mongoose';
import 'dotenv/config';
import Signal from '../src/models/Signal.js';
import instrumentService from '../src/services/instrument.service.js';

async function checkSignals() {
  await mongoose.connect(process.env.MONGODB_URI);
  await instrumentService.init();
  
  const activeSignals = await Signal.find({ status: { $in: ['ACTIVE', 'TARGET_HIT', 'PROFIT'] } });
  console.log(`Found ${activeSignals.length} active signals:`);
  
  for (const s of activeSignals) {
    const inst = instrumentService.findToken(s.symbol, s.strike, s.optionType);
    console.log(`- ${s.symbol} ${s.strike} ${s.optionType} [Status: ${s.status}] -> Token: ${inst?.token || 'NOT FOUND'}`);
  }
  
  process.exit(0);
}

checkSignals();
