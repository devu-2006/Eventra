import { Router } from 'express';
import {
  createEvent,
  updateEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
} from '../controllers/event.controller.js';
import { protect, restrictTo } from '../middleware/auth.middleware.js';

const router = Router();

// ─────────────────────────────────────────
// PUBLIC ROUTES — anyone can access
// ─────────────────────────────────────────
router.get('/', getAllEvents);
router.get('/:id', getEventById);

// ─────────────────────────────────────────
// CLUB ONLY ROUTES — must be logged in as CLUB
// ─────────────────────────────────────────
router.post('/', protect, restrictTo('CLUB'), createEvent);
router.put('/:id', protect, restrictTo('CLUB'), updateEvent);
router.delete('/:id', protect, restrictTo('CLUB'), deleteEvent);

export default router;
