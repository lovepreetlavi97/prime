import User from '../models/User.js';

export default async function (req, reply) {
  try {
    const decoded = await req.jwtVerify();
    if (decoded && decoded.id) {
        const user = await User.findById(decoded.id);
        if (user && user.tokenVersion === decoded.tokenVersion) {
            req.user = user;
        } else {
            req.user = null;
        }
    }
  } catch (err) {
    // Silent fail - user will be anonymous
    req.user = null;
  }
}
