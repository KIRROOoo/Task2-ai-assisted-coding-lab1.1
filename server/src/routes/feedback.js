import express from 'express';
import {
  getAllFeedbacks,
  getFeedback,
  createFeedback,
  getFeedbackSummary
} from '../controllers/feedbackController.js';

const router = express.Router();

// Static routes first
router.get('/summary', getFeedbackSummary);

// Dynamic routes
router.get('/', getAllFeedbacks);
router.get('/:id', getFeedback);
router.post('/', createFeedback);

export default router;
