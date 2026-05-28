import User from '../../models/User.js';

export const getMe = async (req, reply) => {
  const user = await User.findById(req.user.id);
  if (!user) return reply.code(404).send({ error: 'User not found' });
  
  return {
    name: user.name,
    phone: user.phone,
    role: user.role,
    subscription: user.subscription
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
