const mongoose = require('mongoose');

const savingsGoalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    targetAmount: {
        type: Number,
        required: true,
        min: 0
    },
    currentAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    targetDate: {
        type: Date,
        required: true
    },
    description: {
        type: String
    },
    isActive: {
        type: Boolean,
        default: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    category: {
        type: String,
        default: 'General'
    }
}, {
    timestamps: true
});

// Virtual for progress percentage
savingsGoalSchema.virtual('progressPercentage').get(function() {
    return Math.round((this.currentAmount / this.targetAmount) * 100);
});

// Virtual for remaining amount
savingsGoalSchema.virtual('remainingAmount').get(function() {
    return this.targetAmount - this.currentAmount;
});

module.exports = mongoose.model('SavingsGoal', savingsGoalSchema);
