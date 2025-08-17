const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
} = require('../controllers/transactionController');

// All routes are protected
router.use(protect);

// GET /api/transactions
router.get('/', getTransactions);

// GET /api/transactions/stats
router.get('/stats', getTransactionStats);

// GET /api/transactions/:id
router.get('/:id', getTransactionById);

// POST /api/transactions
router.post('/', createTransaction);

// PUT /api/transactions/:id
router.put('/:id', updateTransaction);

// DELETE /api/transactions/:id
router.delete('/:id', deleteTransaction);

module.exports = router;
