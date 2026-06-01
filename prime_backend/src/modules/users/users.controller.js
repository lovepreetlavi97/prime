import User from '../../models/User.js';

export const getMe = async (req, reply) => {
  const user = await User.findById(req.user.id);
  if (!user) return reply.code(404).send({ error: 'User not found' });
  
  // Check if subscription has expired and update DB if so
  if (user.subscription && user.subscription.isActive && user.subscription.endDate) {
    if (new Date(user.subscription.endDate) < new Date()) {
      user.subscription.isActive = false;
      await user.save();
    }
  }

  return {
    name: user.name,
    phone: user.phone,
    role: user.role,
    subscription: user.subscription,
    createdAt: user.createdAt
  };
};

export const updateProfile = async (req, reply) => {
  const { name } = req.body;
  if (!name) return reply.code(400).send({ error: 'Name required' });

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name },
    { new: true }
  );

  return { success: true, name: user.name };
};

export const updateFcmToken = async (req, reply) => {
  const { fcmToken } = req.body;
  if (!fcmToken) return reply.code(400).send({ error: 'fcmToken required' });

  await User.findByIdAndUpdate(
    req.user.id,
    { fcmToken },
    { new: true }
  );

  return { success: true, message: 'FCM Token updated successfully' };
};
