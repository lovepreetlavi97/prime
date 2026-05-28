import 'dotenv/config';
import instagramService from './src/services/instagram.service.js';

const refresh = async () => {
  const shortToken = process.env.INSTAGRAM_ACCESS_TOKEN;
  console.log('🔄 Exchanging token for a 60-day Long-Lived Token...');
  
  try {
    const longToken = await instagramService.getLongLivedToken(shortToken);
    console.log('\n✅ SUCCESS! Copy this token into your .env file:\n');
    console.log(longToken);
    console.log('\n--------------------------------------------------');
  } catch (err) {
    console.error('❌ Failed to exchange token. Make sure Client ID and Secret are correct in .env');
  }
};

refresh();
