const Budget = require('../models/Budget');

// @desc    Get all budgets for a user
// @route   GET /api/budgets
// @access  Private
const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get budget by ID
// @route   GET /api/budgets/:id
// @access  Private
const getBudgetById = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }
        
        // Check if budget belongs to user
        if (budget.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
    try {
        const { name, category, amount, period, startDate, endDate, description } = req.body;
        
        const budget = new Budget({
            user: req.user.id,
            name,
            category,
            amount,
            period,
            startDate: startDate || new Date(),
            endDate,
            description
        });
        
        const savedBudget = await budget.save();
        res.status(201).json(savedBudget);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update budget
// @route   PUT /api/budgets/:id
// @access  Private
const updateBudget = async (req, res) => {
    try {
        const { name, category, amount, period, startDate, endDate, description, isActive } = req.body;
        
        let budget = await Budget.findById(req.params.id);
        
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }
        
        // Check if budget belongs to user
        if (budget.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        budget = await Budget.findByIdAndUpdate(
            req.params.id,
            { name, category, amount, period, startDate, endDate, description, isActive },
            { new: true }
        );
        
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete budget
// @route   DELETE /api/budgets/:id
// @access  Private
const deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        
        if (!budget) {
            return res.status(404).json({ message: 'Budget not found' });
        }
        
        // Check if budget belongs to user
        if (budget.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        await Budget.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Budget removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get budget statistics
// @route   GET /api/budgets/stats
// @access  Private
const getBudgetStats = async (req, res) => {
    try {
        const budgets = await Budget.find({ user: req.user.id, isActive: true });
        
        const stats = {
            totalBudgets: budgets.length,
            totalBudgetAmount: 0,
            activeBudgets: 0,
            categoryBreakdown: {}
        };
        
        budgets.forEach(budget => {
            stats.totalBudgetAmount += budget.amount;
            stats.activeBudgets++;
            
            if (!stats.categoryBreakdown[budget.category]) {
                stats.categoryBreakdown[budget.category] = 0;
            }
            stats.categoryBreakdown[budget.category] += budget.amount;
        });
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getBudgets,
    getBudgetById,
    createBudget,
    updateBudget,
    deleteBudget,
    getBudgetStats
};
