const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetStats
} = require('../controllers/budgetController');

// All routes are protected
router.use(protect);

// GET /api/budgets
router.get('/', getBudgets);

// GET /api/budgets/stats
router.get('/stats', getBudgetStats);

// GET /api/budgets/:id
router.get('/:id', getBudgetById);

// POST /api/budgets
router.post('/', createBudget);

// PUT /api/budgets/:id
router.put('/:id', updateBudget);

// DELETE /api/budgets/:id
router.delete('/:id', deleteBudget);

module.exports = router;
