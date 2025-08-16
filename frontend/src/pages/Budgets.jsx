import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Budgets = () => {
  const { user } = useAuth();
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    amount: '',
    period: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    description: ''
  });

  const categories = [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Healthcare',
    'Education',
    'Housing',
    'Utilities',
    'Insurance',
    'Savings',
    'Other'
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      const response = await axios.get('http://localhost:5001/api/budgets', config);
      setBudgets(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching budgets:', error);
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

      const budgetData = {
        ...formData,
        amount: parseFloat(formData.amount),
        endDate: formData.endDate || null
      };

      if (editingBudget) {
        await axios.put(`http://localhost:5001/api/budgets/${editingBudget._id}`, budgetData, config);
      } else {
        await axios.post('http://localhost:5001/api/budgets', budgetData, config);
      }

      setFormData({
        name: '',
        category: '',
        amount: '',
        period: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        description: ''
      });
      setShowForm(false);
      setEditingBudget(null);
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: budget.endDate ? new Date(budget.endDate).toISOString().split('T')[0] : '',
      description: budget.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const token = localStorage.getItem('token');
        const config = {
          headers: { Authorization: `Bearer ${token}` }
        };
        await axios.delete(`http://localhost:5001/api/budgets/${id}`, config);
        fetchBudgets();
      } catch (error) {
        console.error('Error deleting budget:', error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingBudget(null);
    setFormData({
      name: '',
      category: '',
      amount: '',
      period: 'monthly',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
      description: ''
    });
  };

  const toggleBudgetStatus = async (budget) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      await axios.put(`http://localhost:5001/api/budgets/${budget._id}`, {
        ...budget,
        isActive: !budget.isActive
      }, config);
      fetchBudgets();
    } catch (error) {
      console.error('Error updating budget status:', error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading budgets...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Budget
        </button>
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-2xl font-bold mb-4">
            {editingBudget ? 'Edit Budget' : 'Add New Budget'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Budget Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="e.g., Grocery Budget"
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
                  <option value="">Select Category</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Period</label>
                <select
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                >
                  {periods.map(period => (
                    <option key={period.value} value={period.value}>{period.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">End Date (Optional)</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-2 border rounded"
                placeholder="Enter budget description"
                rows="3"
              />
            </div>
            
            <div className="flex space-x-4">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                {editingBudget ? 'Update' : 'Add'} Budget
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

      {/* Budgets List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => (
          <div key={budget._id} className={`bg-white p-6 rounded-lg shadow ${!budget.isActive ? 'opacity-60' : ''}`}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-semibold">{budget.name}</h3>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                budget.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {budget.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <p className="text-gray-600">
                <span className="font-medium">Category:</span> {budget.category}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Amount:</span> ${budget.amount.toFixed(2)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Period:</span> {budget.period.charAt(0).toUpperCase() + budget.period.slice(1)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Start Date:</span> {new Date(budget.startDate).toLocaleDateString()}
              </p>
              {budget.endDate && (
                <p className="text-gray-600">
                  <span className="font-medium">End Date:</span> {new Date(budget.endDate).toLocaleDateString()}
                </p>
              )}
              {budget.description && (
                <p className="text-gray-600">
                  <span className="font-medium">Description:</span> {budget.description}
                </p>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(budget)}
                className="text-blue-600 hover:text-blue-900 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => toggleBudgetStatus(budget)}
                className={`text-sm ${
                  budget.isActive ? 'text-orange-600 hover:text-orange-900' : 'text-green-600 hover:text-green-900'
                }`}
              >
                {budget.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={() => handleDelete(budget._id)}
                className="text-red-600 hover:text-red-900 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {budgets.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No budgets found. Create your first budget to start planning!
        </div>
      )}
    </div>
  );
};

export default Budgets;
