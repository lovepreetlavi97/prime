import { TelegramClient } from 'telegram';
import { StringSession } from 'telegram/sessions/index.js';
import input from 'input';
import 'dotenv/config';

async function login() {
  const apiId = parseInt(process.env.TELEGRAM_API_ID);
  const apiHash = process.env.TELEGRAM_API_HASH;

  if (!apiId || !apiHash) {
    console.error('❌ TELEGRAM_API_ID or TELEGRAM_API_HASH is missing in .env');
    process.exit(1);
  }

  console.log('Initializing Telegram client...');
  const client = new TelegramClient(new StringSession(''), apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await input.text('📱 Enter your Telegram phone number (with country code, e.g., +91XXXXXXXXXX): '),
    password: async () => await input.text('🔐 Enter your 2-Factor Authentication (2FA) password (leave blank if none): '),
    phoneCode: async () => await input.text('💬 Enter the OTP verification code sent to your Telegram app: '),
    onError: (err) => console.error('Error during login:', err.message)
  });

  const sessionString = client.session.save();
  console.log('\n✅ Telegram Login Successful!');
  console.log('\n------------------- COPY SESSION STRING BELOW -------------------');
  console.log(sessionString);
  console.log('-----------------------------------------------------------------\n');
  console.log('Please copy this entire session string and paste it as the value for TELEGRAM_SESSION in your backend .env file, then restart the server.');
  process.exit(0);
}

login().catch(err => {
  console.error('❌ Login failed:', err);
  process.exit(1);
});
