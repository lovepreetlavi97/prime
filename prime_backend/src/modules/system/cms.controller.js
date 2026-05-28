import LegalDocument from '../../models/LegalDocument.js';
import ContactSubmission from '../../models/ContactSubmission.js';
import logger from '../../utils/logger.js';

// --- LEGAL DOCUMENTS CONTROLLERS ---

export const getLegalDocument = async (req, reply) => {
  try {
    const { type } = req.params;
    let doc = await LegalDocument.findOne({ type });
    if (!doc) {
      // Return a blank template if not initialized yet
      doc = {
        type,
        title: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        content: `Default content for ${type}. Please edit in administration panel.`
      };
    }
    return doc;
  } catch (err) {
    logger.error(`Error fetching legal doc: ${err.message}`);
    return reply.code(500).send({ error: 'Failed to fetch legal document' });
  }
};

export const updateLegalDocument = async (req, reply) => {
  try {
    const { type } = req.params;
    const { title, content } = req.body;

    const doc = await LegalDocument.findOneAndUpdate(
      { type },
      { title, content },
      { upsert: true, new: true, runValidators: true }
    );

    return { success: true, data: doc };
  } catch (err) {
    logger.error(`Error updating legal doc: ${err.message}`);
    return reply.code(500).send({ error: 'Failed to update legal document' });
  }
};

// --- CONTACT SUBMISSIONS CONTROLLERS ---

export const createContactSubmission = async (req, reply) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return reply.code(400).send({ error: 'Name, email, subject, and message are required' });
    }

    const submission = await ContactSubmission.create({
      name,
      email,
      phone,
      subject,
      message,
      status: 'PENDING'
    });

    return reply.code(201).send({ success: true, data: submission });
  } catch (err) {
    logger.error(`Error creating contact submission: ${err.message}`);
    return reply.code(500).send({ error: 'Failed to submit contact request' });
  }
};

export const getContactSubmissions = async (req, reply) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const [submissions, total] = await Promise.all([
      ContactSubmission.find(query).sort({ createdAt: -1 }).skip(skip).limit(parsedLimit),
      ContactSubmission.countDocuments(query)
    ]);

    return {
      success: true,
      data: submissions,
      pagination: {
        page: parsedPage,
        limit: parsedLimit,
        total,
        totalPages: Math.ceil(total / parsedLimit)
      }
    };
  } catch (err) {
    logger.error(`Error getting contact submissions: ${err.message}`);
    return reply.code(500).send({ error: 'Failed to query contact submissions' });
  }
};

export const resolveContactSubmission = async (req, reply) => {
  try {
    const { id } = req.params;
    const { replyText } = req.body;

    const submission = await ContactSubmission.findByIdAndUpdate(
      id,
      {
        status: 'RESOLVED',
        reply: replyText || 'Resolved by Administrator'
      },
      { new: true }
    );

    if (!submission) {
      return reply.code(404).send({ error: 'Contact submission not found' });
    }

    return { success: true, data: submission };
  } catch (err) {
    logger.error(`Error resolving contact submission: ${err.message}`);
    return reply.code(500).send({ error: 'Failed to resolve contact submission' });
  }
};
