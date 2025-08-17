const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    getSavingsGoals,
    getSavingsGoalById,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addAmountToGoal,
    getSavingsGoalStats
} = require('../controllers/savingsGoalController');

// All routes are protected
router.use(protect);

// GET /api/savings-goals
router.get('/', getSavingsGoals);

// GET /api/savings-goals/stats
router.get('/stats', getSavingsGoalStats);

// GET /api/savings-goals/:id
router.get('/:id', getSavingsGoalById);

// POST /api/savings-goals
router.post('/', createSavingsGoal);

// PUT /api/savings-goals/:id
router.put('/:id', updateSavingsGoal);

// PUT /api/savings-goals/:id/add-amount
router.put('/:id/add-amount', addAmountToGoal);

// DELETE /api/savings-goals/:id
router.delete('/:id', deleteSavingsGoal);

module.exports = router;
