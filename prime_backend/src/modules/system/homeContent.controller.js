import HomeContent from '../../models/HomeContent.js';
import { invalidateCachePattern } from '../../middlewares/cacheMiddleware.js';

export const getHomeContent = async (req, reply) => {
  try {
    let content = await HomeContent.findOne().sort({ createdAt: -1 });
    if (!content) {
      return reply.code(404).send({ error: 'No content found' });
    }
    return content;
  } catch (err) {
    throw err;
  }
};

export const updateHomeContent = async (req, reply) => {
  try {
    const content = await HomeContent.findOneAndUpdate(
      {}, // Match first found
      req.body,
      { upsert: true, new: true, runValidators: true }
    );
    await invalidateCachePattern('*home-content*');
    return { success: true, data: content };
  } catch (err) {
    throw err;
  }
};

export const seedHomeContent = async (req, reply) => {
  const defaultData = {
    hero: {
      headline: "You’ve seen trades work… just not when you took them.",
      subtext: "Entered late. Exited early. Or skipped the right one.\n\nThis removes that confusion.\n\nClear signals. Clear entry. Clear exit.",
      cta: "See Live Signal"
    },
    waitingState: [
      "Scanning market for clean setups…",
      "Avoiding low-quality trades…",
      "Waiting for confirmation before entry…",
      "Tracking volume and momentum…",
      "No forced trades. Only valid setups…",
      "Watching market structure closely…"
    ],
    anticipation: "🟡 Next signal can trigger anytime",
    lastSignal: "Last Signal: +78% in 6 minutes — most people saw it, few followed it.",
    trust: "Not every trade wins.\n\nBut a structured approach wins over time.\n\nNo random calls. No guesswork. Only disciplined setups.",
    guidance: [
      "Wait for the entry zone",
      "Do not chase price after breakout",
      "Always respect stop loss",
      "Book profits step by step",
      "Skip trades that don’t meet conditions"
    ],
    upgrade: {
      headline: "Most traders enter after the move is already gone.",
      subtext: "Pro members see it when it actually matters.\n\nEntry. Targets. Timing. Fully visible.",
      cta: "Unlock Full Signals"
    },
    locked: "You are viewing partial information.\n\nAnd partial information leads to wrong decisions.\n\nUnlock full signal to see exact entry, targets, and stop loss.",
    microLines: [
      "Discipline beats speed.",
      "Missing a trade is fine. Entering wrong is not.",
      "Clarity reduces mistakes.",
      "Patience protects capital.",
      "Good trades come to those who wait."
    ]
  };

  try {
    const exists = await HomeContent.findOne();
    if (exists) {
      return reply.code(400).send({ error: 'Content already seeded' });
    }
    const seeded = await HomeContent.create(defaultData);
    await invalidateCachePattern('*home-content*');
    return { success: true, message: 'Default content seeded successfully', data: seeded };
  } catch (err) {
    throw err;
  }
};
