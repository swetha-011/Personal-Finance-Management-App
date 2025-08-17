const SavingsGoal = require('../models/SavingsGoal');

// @desc    Get all savings goals for a user
// @route   GET /api/savings-goals
// @access  Private
const getSavingsGoals = async (req, res) => {
    try {
        const savingsGoals = await SavingsGoal.find({ user: req.user.id })
            .sort({ createdAt: -1 });
        
        res.json(savingsGoals);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get savings goal by ID
// @route   GET /api/savings-goals/:id
// @access  Private
const getSavingsGoalById = async (req, res) => {
    try {
        const savingsGoal = await SavingsGoal.findById(req.params.id);
        
        if (!savingsGoal) {
            return res.status(404).json({ message: 'Savings goal not found' });
        }
        
        // Check if savings goal belongs to user
        if (savingsGoal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        res.json(savingsGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new savings goal
// @route   POST /api/savings-goals
// @access  Private
const createSavingsGoal = async (req, res) => {
    try {
        const { name, targetAmount, targetDate, description, priority, category } = req.body;
        
        const savingsGoal = new SavingsGoal({
            user: req.user.id,
            name,
            targetAmount,
            targetDate,
            description,
            priority,
            category
        });
        
        const savedSavingsGoal = await savingsGoal.save();
        res.status(201).json(savedSavingsGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update savings goal
// @route   PUT /api/savings-goals/:id
// @access  Private
const updateSavingsGoal = async (req, res) => {
    try {
        const { name, targetAmount, currentAmount, targetDate, description, priority, category, isActive } = req.body;
        
        let savingsGoal = await SavingsGoal.findById(req.params.id);
        
        if (!savingsGoal) {
            return res.status(404).json({ message: 'Savings goal not found' });
        }
        
        // Check if savings goal belongs to user
        if (savingsGoal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        savingsGoal = await SavingsGoal.findByIdAndUpdate(
            req.params.id,
            { name, targetAmount, currentAmount, targetDate, description, priority, category, isActive },
            { new: true }
        );
        
        res.json(savingsGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings-goals/:id
// @access  Private
const deleteSavingsGoal = async (req, res) => {
    try {
        const savingsGoal = await SavingsGoal.findById(req.params.id);
        
        if (!savingsGoal) {
            return res.status(404).json({ message: 'Savings goal not found' });
        }
        
        // Check if savings goal belongs to user
        if (savingsGoal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        await SavingsGoal.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Savings goal removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add amount to savings goal
// @route   PUT /api/savings-goals/:id/add-amount
// @access  Private
const addAmountToGoal = async (req, res) => {
    try {
        const { amount } = req.body;
        
        let savingsGoal = await SavingsGoal.findById(req.params.id);
        
        if (!savingsGoal) {
            return res.status(404).json({ message: 'Savings goal not found' });
        }
        
        // Check if savings goal belongs to user
        if (savingsGoal.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        savingsGoal.currentAmount += parseFloat(amount);
        
        // Check if goal is completed
        if (savingsGoal.currentAmount >= savingsGoal.targetAmount) {
            savingsGoal.isActive = false;
        }
        
        const updatedGoal = await savingsGoal.save();
        res.json(updatedGoal);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get savings goals statistics
// @route   GET /api/savings-goals/stats
// @access  Private
const getSavingsGoalStats = async (req, res) => {
    try {
        const savingsGoals = await SavingsGoal.find({ user: req.user.id });
        
        const stats = {
            totalGoals: savingsGoals.length,
            activeGoals: 0,
            completedGoals: 0,
            totalTargetAmount: 0,
            totalCurrentAmount: 0,
            totalProgress: 0
        };
        
        savingsGoals.forEach(goal => {
            stats.totalTargetAmount += goal.targetAmount;
            stats.totalCurrentAmount += goal.currentAmount;
            
            if (goal.isActive) {
                stats.activeGoals++;
            } else {
                stats.completedGoals++;
            }
        });
        
        if (stats.totalTargetAmount > 0) {
            stats.totalProgress = Math.round((stats.totalCurrentAmount / stats.totalTargetAmount) * 100);
        }
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSavingsGoals,
    getSavingsGoalById,
    createSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addAmountToGoal,
    getSavingsGoalStats
};
