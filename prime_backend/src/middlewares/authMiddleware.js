import User from '../models/User.js';

export default async function (req, reply) {
  try {
    const payload = await req.jwtVerify();
    
    // Check if user still exists and tokenVersion matches
    const user = await User.findById(payload.id);
    
    if (!user) {
      console.log('❌ AUTH FAIL: User not found', payload.id);
      return reply.code(401).send({ error: 'User not found' });
    }

    if (user.tokenVersion !== payload.tokenVersion) {
      console.log(`❌ AUTH FAIL: Version Mismatch. DB: ${user.tokenVersion}, JWT: ${payload.tokenVersion}`);
      return reply.code(401).send({ error: 'Session expired or logged in on another device' });
    }
    
    // Attach user to request for downstream handlers
    req.user = user;
  } catch (err) {
    reply.send(err);
  }
}
