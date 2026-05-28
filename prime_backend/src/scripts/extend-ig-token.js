import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extendToken() {
  const shortLivedToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  const clientId = process.env.INSTAGRAM_CLIENT_ID;
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET;

  if (!shortLivedToken || !clientId || !clientSecret) {
    console.error('❌ Missing required environment variables: INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_CLIENT_ID, or INSTAGRAM_CLIENT_SECRET');
    return;
  }

  console.log('🔄 Requesting Long-Lived Access Token (60 days)...');

  try {
    const response = await axios.get('https://graph.facebook.com/v19.0/oauth/access_token', {
      params: {
        grant_type: 'fb_exchange_token',
        client_id: clientId,
        client_secret: clientSecret,
        fb_exchange_token: shortLivedToken
      }
    });

    const longLivedToken = response.data.access_token;
    const expiresIn = response.data.expires_in;

    if (longLivedToken) {
      console.log('✅ Successfully received Long-Lived Token!');
      console.log(`⏳ Expires in: ${Math.floor(expiresIn / 86400)} days`);

      // Update .env file
      const envPath = path.join(__dirname, '../../.env');
      let envContent = fs.readFileSync(envPath, 'utf8');

      const regex = /INSTAGRAM_ACCESS_TOKEN=.*/;
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, `INSTAGRAM_ACCESS_TOKEN=${longLivedToken}`);
        fs.writeFileSync(envPath, envContent);
        console.log('📝 Updated .env with the new Long-Lived Token!');
      } else {
        console.error('❌ Could not find INSTAGRAM_ACCESS_TOKEN in .env to update.');
      }
    }
  } catch (error) {
    console.error('❌ Failed to extend token:', error.response?.data || error.message);
  }
}

extendToken();