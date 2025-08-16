import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Reports = () => {
  const { user } = useAuth();
  const [transactionStats, setTransactionStats] = useState({});
  const [budgetStats, setBudgetStats] = useState({});
  const [savingsStats, setSavingsStats] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    if (user) {
      fetchReportData();
    }
  }, [user, fetchReportData]);

  const fetchReportData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Calculate date range
      const now = new Date();
      let startDate, endDate;
      
      switch (dateRange) {
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      }
      
      endDate = now;

      // Fetch transaction statistics
      const statsResponse = await axios.get(
        `http://localhost:5001/api/transactions/stats?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
        config
      );
      setTransactionStats(statsResponse.data);

      // Fetch all transactions for detailed analysis
      const transactionsResponse = await axios.get('http://localhost:5001/api/transactions', config);
      setTransactions(transactionsResponse.data);

      // Fetch budget statistics
      const budgetResponse = await axios.get('http://localhost:5001/api/budgets/stats', config);
      setBudgetStats(budgetResponse.data);

      // Fetch savings goals statistics
      const savingsResponse = await axios.get('http://localhost:5001/api/savings-goals/stats', config);
      setSavingsStats(savingsResponse.data);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching report data:', error);
      setLoading(false);
    }
  }, [dateRange]);

  const getCategoryBreakdown = () => {
    const breakdown = {};
    transactions.forEach(transaction => {
      if (selectedCategory === 'all' || transaction.category === selectedCategory) {
        if (!breakdown[transaction.category]) {
          breakdown[transaction.category] = { income: 0, expenses: 0 };
        }
        if (transaction.type === 'income') {
          breakdown[transaction.category].income += transaction.amount;
        } else {
          breakdown[transaction.category].expenses += transaction.amount;
        }
      }
    });
    return breakdown;
  };

  const getMonthlyTrend = () => {
    const monthlyData = {};
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else {
        monthlyData[monthKey].expenses += transaction.amount;
      }
    });
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6); // Last 6 months
  };

  const getTopExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const getTopIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading reports...</div>
      </div>
    );
  }

  const categoryBreakdown = getCategoryBreakdown();
  const monthlyTrend = getMonthlyTrend();
  const topExpenses = getTopExpenses();
  const topIncome = getTopIncome();

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Financial Reports</h1>
        <div className="flex space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="all">All Categories</option>
            {Object.keys(categoryBreakdown).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-800">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(transactionStats.totalIncome || 0)}
          </p>
        </div>
        
        <div className="bg-red-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-red-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(transactionStats.totalExpenses || 0)}
          </p>
        </div>
        
        <div className={`p-6 rounded-lg shadow ${
          (transactionStats.netAmount || 0) >= 0 ? 'bg-blue-100' : 'bg-orange-100'
        }`}>
          <h3 className="text-lg font-semibold">Net Amount</h3>
          <p className={`text-2xl font-bold ${
            (transactionStats.netAmount || 0) >= 0 ? 'text-blue-600' : 'text-orange-600'
          }`}>
            {formatCurrency(transactionStats.netAmount || 0)}
          </p>
        </div>
        
        <div className="bg-purple-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-purple-800">Transactions</h3>
          <p className="text-2xl font-bold text-purple-600">
            {transactionStats.transactionCount || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Category Breakdown</h2>
          {Object.keys(categoryBreakdown).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(categoryBreakdown).map(([category, data]) => (
                <div key={category} className="border p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">{category}</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-600">Income: {formatCurrency(data.income)}</p>
                      <p className="text-red-600">Expenses: {formatCurrency(data.expenses)}</p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Net: {formatCurrency(data.income - data.expenses)}
                      </p>
                      <p className="text-gray-600">
                        {data.income + data.expenses > 0 
                          ? `${((data.income / (data.income + data.expenses)) * 100).toFixed(1)}% income`
                          : 'No transactions'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No data available for selected filters.</p>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Monthly Trend (Last 6 Months)</h2>
          {monthlyTrend.length > 0 ? (
            <div className="space-y-4">
              {monthlyTrend.map(([month, data]) => (
                <div key={month} className="border p-4 rounded">
                  <h3 className="font-semibold text-lg mb-2">
                    {new Date(month + '-01').toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-green-600">Income: {formatCurrency(data.income)}</p>
                      <p className="text-red-600">Expenses: {formatCurrency(data.expenses)}</p>
                    </div>
                    <div>
                      <p className="font-semibold">
                        Net: {formatCurrency(data.income - data.expenses)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No monthly data available.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        {/* Top Expenses */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Top 5 Expenses</h2>
          {topExpenses.length > 0 ? (
            <div className="space-y-3">
              {topExpenses.map((transaction, index) => (
                <div key={transaction._id} className="flex justify-between items-center p-3 bg-red-50 rounded">
                  <div>
                    <p className="font-semibold">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.category}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{formatCurrency(transaction.amount)}</p>
                    <p className="text-xs text-gray-500">#{index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No expense transactions found.</p>
          )}
        </div>

        {/* Top Income */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Top 5 Income Sources</h2>
          {topIncome.length > 0 ? (
            <div className="space-y-3">
              {topIncome.map((transaction, index) => (
                <div key={transaction._id} className="flex justify-between items-center p-3 bg-green-50 rounded">
                  <div>
                    <p className="font-semibold">{transaction.description}</p>
                    <p className="text-sm text-gray-600">{transaction.category}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(transaction.amount)}</p>
                    <p className="text-xs text-gray-500">#{index + 1}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No income transactions found.</p>
          )}
        </div>
      </div>

      {/* Budget and Savings Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Budget Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Budgets:</span>
              <span className="font-semibold">{budgetStats.totalBudgets || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Budgets:</span>
              <span className="font-semibold">{budgetStats.activeBudgets || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Budget Amount:</span>
              <span className="font-semibold">{formatCurrency(budgetStats.totalBudgetAmount || 0)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Savings Goals Summary</h2>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Total Goals:</span>
              <span className="font-semibold">{savingsStats.totalGoals || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Active Goals:</span>
              <span className="font-semibold">{savingsStats.activeGoals || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Goals:</span>
              <span className="font-semibold">{savingsStats.completedGoals || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Progress:</span>
              <span className="font-semibold">{savingsStats.totalProgress || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>Total Saved:</span>
              <span className="font-semibold">{formatCurrency(savingsStats.totalCurrentAmount || 0)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
