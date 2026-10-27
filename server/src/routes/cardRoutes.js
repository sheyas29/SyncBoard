import express from 'express';
import {
  createCard,
  updateCard,
  moveCard,
  deleteCard,
} from '../controllers/cardController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All card routes require authentication
router.use(protect);

router.post('/', createCard);

router.route('/:id')
  .put(updateCard)
  .delete(deleteCard);

router.patch('/:id/move', moveCard);

export default router;
