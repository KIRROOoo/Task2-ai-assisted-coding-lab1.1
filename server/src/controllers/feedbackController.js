import { Feedback } from '../models/Feedback.js';

// GET /api/feedback
export async function getAllFeedbacks(req, res, next) {
  try {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    res.json({ feedbacks });
  } catch (err) {
    next(err);
  }
}

// GET /api/feedback/:id
export async function getFeedback(req, res, next) {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }
    res.json({ feedback });
  } catch (err) {
    next(err);
  }
}

// POST /api/feedback
export async function createFeedback(req, res, next) {
  try {
    const { workshopCode, score, comment, submittedBy } = req.body;

    if (!workshopCode || score === undefined) {
      return res.status(400).json({ message: 'workshopCode and score are required' });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'score must be between 1 and 5' });
    }

    const feedback = await Feedback.create({ workshopCode, score, comment, submittedBy });
    res.status(201).json({ feedback });
  } catch (err) {
    // Mongoose duplicate key error (code 11000)
    if (err.code === 11000) {
      return res.status(409).json({ message: 'Feedback already submitted for this workshop by this user' });
    }
    next(err);
  }
}

// GET /api/feedback/summary?workshopCode=WS101
export async function getFeedbackSummary(req, res, next) {
  try {
    const { workshopCode } = req.query;

    if (!workshopCode) {
      return res.status(400).json({ message: 'workshopCode is required' });
    }

    const result = await Feedback.aggregate([
      { $match: { workshopCode } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          feedbackCount: { $sum: 1 }
        }
      }
    ]);

    if (result.length === 0) {
      return res.json({
        workshopCode,
        averageScore: 0,
        feedbackCount: 0
      });
    }

    const summary = result[0];
    res.json({
      workshopCode,
      averageScore: summary.averageScore,
      feedbackCount: summary.feedbackCount
    });
  } catch (err) {
    next(err);
  }
}
