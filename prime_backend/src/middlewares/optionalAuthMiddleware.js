import User from '../models/User.js';

export default async function (req, reply) {
  try {
    const payload = await req.jwtVerify();
    
    if (payload && payload.id) {
      const user = await User.findById(payload.id);
      if (user && user.tokenVersion === payload.tokenVersion) {
        req.user = user;
      }
    }
  } catch (err) {
    // Silently ignore jwt errors for optional auth
    req.user = null;
  }
}
