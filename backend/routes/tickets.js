const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/rbac');

// User routes
router.get('/my-tickets', authMiddleware, ticketController.getMyTickets);
router.get('/:ticketId', authMiddleware, ticketController.getTicketById);

router.post('/', authMiddleware, [
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('description').trim().notEmpty().withMessage('Description is required')
], ticketController.createTicket);

router.post('/:ticketId/messages', authMiddleware, [
  body('message').trim().notEmpty().withMessage('Message is required')
], ticketController.addMessage);

router.post('/:ticketId/close', authMiddleware, ticketController.closeTicket);

// Admin routes
router.get('/', authMiddleware, requireAdmin, ticketController.getAllTickets);
router.put('/:ticketId/status', authMiddleware, requireAdmin, ticketController.updateTicketStatus);
router.delete('/:ticketId', authMiddleware, requireAdmin, ticketController.deleteTicket);
router.get('/stats', authMiddleware, requireAdmin, ticketController.getTicketStats);

module.exports = router;