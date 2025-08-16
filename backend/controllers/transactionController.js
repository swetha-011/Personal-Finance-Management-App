const Transaction = require('../models/Transaction');

// @desc    Get all transactions for a user
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.user.id })
            .sort({ date: -1 });
        
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Check if transaction belongs to user
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res) => {
    try {
        const { type, category, amount, description, date, tags } = req.body;
        
        const transaction = new Transaction({
            user: req.user.id,
            type,
            category,
            amount,
            description,
            date: date || new Date(),
            tags: tags || []
        });
        
        const savedTransaction = await transaction.save();
        res.status(201).json(savedTransaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res) => {
    try {
        const { type, category, amount, description, date, tags } = req.body;
        
        let transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Check if transaction belongs to user
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        transaction = await Transaction.findByIdAndUpdate(
            req.params.id,
            { type, category, amount, description, date, tags },
            { new: true }
        );
        
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        
        // Check if transaction belongs to user
        if (transaction.user.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        
        await Transaction.findByIdAndDelete(req.params.id);
        
        res.json({ message: 'Transaction removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get transaction statistics
// @route   GET /api/transactions/stats
// @access  Private
const getTransactionStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        
        let query = { user: req.user.id };
        
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }
        
        const transactions = await Transaction.find(query);
        
        const stats = {
            totalIncome: 0,
            totalExpenses: 0,
            netAmount: 0,
            transactionCount: transactions.length,
            categoryBreakdown: {}
        };
        
        transactions.forEach(transaction => {
            if (transaction.type === 'income') {
                stats.totalIncome += transaction.amount;
            } else {
                stats.totalExpenses += transaction.amount;
            }
            
            // Category breakdown
            if (!stats.categoryBreakdown[transaction.category]) {
                stats.categoryBreakdown[transaction.category] = {
                    income: 0,
                    expenses: 0
                };
            }
            
            if (transaction.type === 'income') {
                stats.categoryBreakdown[transaction.category].income += transaction.amount;
            } else {
                stats.categoryBreakdown[transaction.category].expenses += transaction.amount;
            }
        });
        
        stats.netAmount = stats.totalIncome - stats.totalExpenses;
        
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTransactions,
    getTransactionById,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getTransactionStats
};
