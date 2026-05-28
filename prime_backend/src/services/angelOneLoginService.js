import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const {
  ANGEL_LOGIN_URL,
  SMARTAPI_KEY,
  CLIENT_CODE,
  TRADING_PIN,
  TOTP_SECRET,
} = process.env;

// --- ATOMIC LOGIN LOCK ---
let loginPromise = null;
let cachedAuth = null;
let lastLoginTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Robust Zero-Dependency TOTP Generator
 */
function generateTotp(secret) {
  try {
    const cleanSecret = secret.replace(/\s+/g, '').toUpperCase();
    const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let bits = '';
    for (let i = 0; i < cleanSecret.length; i++) {
      const val = base32chars.indexOf(cleanSecret.charAt(i));
      if (val === -1) continue;
      bits += val.toString(2).padStart(5, '0');
    }
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.substring(i, i + 8), 2));
    }
    const key = Buffer.from(bytes);
    const epoch = Math.floor(Date.now() / 1000);
    const time = Buffer.alloc(8);
    time.writeBigInt64BE(BigInt(Math.floor(epoch / 30)));
    const hmac = crypto.createHmac('sha1', key);
    hmac.update(time);
    const hmacResult = hmac.digest();
    const offset = hmacResult[hmacResult.length - 1] & 0xf;
    const value = (
      ((hmacResult[offset] & 0x7f) << 24) |
      ((hmacResult[offset + 1] & 0xff) << 16) |
      ((hmacResult[offset + 2] & 0xff) << 8) |
      (hmacResult[offset + 3] & 0xff)
    ) % 1000000;
    return value.toString().padStart(6, '0');
  } catch (err) {
    throw new Error("Invalid TOTP Secret format.");
  }
}

/**
 * Login to Angel One with Atomic Locking and Caching
 */
export async function loginToAngelOne(manualTotp = null) {
  // If a login is already in progress, wait for it
  if (loginPromise) return loginPromise;

  // If we have a fresh cached token, use it
  const now = Date.now();
  if (cachedAuth && (now - lastLoginTime < CACHE_TTL) && !manualTotp) {
    return cachedAuth;
  }

  loginPromise = (async () => {
    try {
      if (!TRADING_PIN || TRADING_PIN === 'your_trading_pin_here') {
        throw new Error('TRADING_PIN not configured');
      }

      let totp;
      if (manualTotp) {
        totp = manualTotp;
      } else if (TOTP_SECRET && TOTP_SECRET !== 'your_totp_secret_here') {
        totp = generateTotp(TOTP_SECRET);
      } else {
        throw new Error('TOTP_SECRET not configured');
      }

      const loginUrl = "https://apiconnect.angelbroking.com/rest/auth/angelbroking/user/v1/loginByPassword";
      const body = { clientcode: CLIENT_CODE, password: TRADING_PIN, totp: totp };
      const headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "X-UserType": "USER",
        "X-SourceID": "WEB",
        "X-ClientLocalIP": "127.0.0.1",
        "X-ClientPublicIP": "127.0.0.1",
        "X-MACAddress": "00:00:00:00:00:00",
        "X-PrivateKey": SMARTAPI_KEY,
      };

      console.log(`🔐 [ATOMIC] Attempting Angel One login for ${CLIENT_CODE}...`);
      const res = await axios.post(loginUrl, body, { headers });

      if (res.data?.status === true) {
        const data = res.data?.data ?? {};
        console.log("✅ [ATOMIC] Angel One login successful!");

        cachedAuth = {
          feedToken: data.feedToken,
          jwt: data.jwtToken,
          clientCode: CLIENT_CODE,
          success: true
        };
        lastLoginTime = Date.now();
        return cachedAuth;
      } else {
        throw new Error(res.data?.message || 'Login failed');
      }
    } finally {
      loginPromise = null; // Release the lock
    }
  })();

  return loginPromise;
}

export function validateCredentials() {
  const required = [SMARTAPI_KEY, CLIENT_CODE, TRADING_PIN];
  return required.every(v => v && !v.includes('your_'));
}
