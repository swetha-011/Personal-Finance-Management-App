import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const SavingsGoals = () => {
  const { user } = useAuth();
  const [savingsGoals, setSavingsGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showAddAmountForm, setShowAddAmountForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: '',
    description: '',
    priority: 'medium',
    category: 'General'
  });
  const [addAmountData, setAddAmountData] = useState({
    amount: ''
  });

  const categories = [
    'General',
    'Emergency Fund',
    'Vacation',
    'Home',
    'Car',
    'Education',
    'Wedding',
    'Retirement',
    'Investment',
    'Other'
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    if (user) {
      fetchSavingsGoals();
    }
  }, [user]);

  const fetchSavingsGoals = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get('http://localhost:5001/api/savings-goals', config);
      setSavingsGoals(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      const goalData = {
        ...formData,
        targetAmount: parseFloat(formData.targetAmount)
      };

      if (editingGoal) {
        await axios.put(`http://localhost:5001/api/savings-goals/${editingGoal._id}`, goalData, config);
      } else {
        await axios.post('http://localhost:5001/api/savings-goals', goalData, config);
      }

      setFormData({
        name: '',
        targetAmount: '',
        targetDate: '',
        description: '',
        priority: 'medium',
        category: 'General'
      });
      setShowForm(false);
      setEditingGoal(null);
      fetchSavingsGoals();
    } catch (error) {
      console.error('Error saving savings goal:', error);
    }
  };

  const handleAddAmount = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      await axios.put(
        `http://localhost:5001/api/savings-goals/${selectedGoal._id}/add-amount`,
        { amount: parseFloat(addAmountData.amount) },
        config
      );

      setAddAmountData({ amount: '' });
      setShowAddAmountForm(false);
      setSelectedGoal(null);
      fetchSavingsGoals();
    } catch (error) {
      console.error('Error adding amount to goal:', error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      targetAmount: goal.targetAmount.toString(),
      targetDate: new Date(goal.targetDate).toISOString().split('T')[0],
      description: goal.description || '',
      priority: goal.priority,
      category: goal.category
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this savings goal?')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        await axios.delete(`http://localhost:5001/api/savings-goals/${id}`, config);
        fetchSavingsGoals();
      } catch (error) {
        console.error('Error deleting savings goal:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingGoal(null);
    setFormData({
      name: '',
      targetAmount: '',
      targetDate: '',
      description: '',
      priority: 'medium',
      category: 'General'
    });
  };

  const openAddAmountForm = (goal) => {
    setSelectedGoal(goal);
    setShowAddAmountForm(true);
  };

  const calculateProgress = (current, target) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (targetDate) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading savings goals...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Savings Goals</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Savings Goal
        </button>
      </div>

      {/* Savings Goal Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingGoal ? 'Edit Savings Goal' : 'Add New Savings Goal'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Goal Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Emergency Fund"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Target Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Target Date</label>
                <input
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Priority</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  {priorities.map(priority => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Enter goal description"
                rows="3"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editingGoal ? 'Update' : 'Add'} Goal
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Amount Form */}
      {showAddAmountForm && selectedGoal && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">Add Amount to "{selectedGoal.name}"</h2>
          <form onSubmit={handleAddAmount} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Amount to Add</label>
              <input
                type="number"
                step="0.01"
                value={addAmountData.amount}
                onChange={(e) => setAddAmountData({ amount: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="0.00"
                required
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Add Amount
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddAmountForm(false);
                  setSelectedGoal(null);
                  setAddAmountData({ amount: '' });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Savings Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const daysRemaining = getDaysRemaining(goal.targetDate);
          const priorityInfo = priorities.find(p => p.value === goal.priority);
          
          return (
            <div key={goal._id} className={`bg-white p-6 rounded-lg shadow ${!goal.isActive ? 'opacity-60' : ''}`}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{goal.name}</h3>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${priorityInfo.color}`}>
                  {priorityInfo.label}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Current: <span className="font-semibold text-green-600">${goal.currentAmount.toFixed(2)}</span></p>
                    <p className="text-gray-600">Target: <span className="font-semibold">${goal.targetAmount.toFixed(2)}</span></p>
                  </div>
                  <div>
                    <p className="text-gray-600">Remaining: <span className="font-semibold text-red-600">${(goal.targetAmount - goal.currentAmount).toFixed(2)}</span></p>
                    <p className="text-gray-600">Days Left: <span className="font-semibold">{daysRemaining}</span></p>
                  </div>
                </div>
                
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Category:</span> {goal.category}
                </p>
                <p className="text-gray-600 text-sm">
                  <span className="font-medium">Target Date:</span> {new Date(goal.targetDate).toLocaleDateString()}
                </p>
                {goal.description && (
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Description:</span> {goal.description}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openAddAmountForm(goal)}
                  className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  disabled={!goal.isActive}
                >
                  Add Amount
                </button>
                <button
                  onClick={() => handleEdit(goal)}
                  className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(goal._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
              
              {goal.currentAmount >= goal.targetAmount && (
                <div className="mt-3 p-2 bg-green-100 text-green-800 rounded text-sm text-center">
                  🎉 Goal Achieved!
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {savingsGoals.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No savings goals found. Create your first goal to start saving!
        </div>
      )}
    </div>
  );
};

export default SavingsGoals;
