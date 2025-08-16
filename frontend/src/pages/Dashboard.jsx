import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    netAmount: 0,
    transactionCount: 0,
    categoryBreakdown: {}
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch transaction statistics
      const statsResponse = await axios.get('http://localhost:5001/api/transactions/stats', config);
      setStats(statsResponse.data);

      // Fetch recent transactions
      const transactionsResponse = await axios.get('http://localhost:5001/api/transactions', config);
      setRecentTransactions(transactionsResponse.data.slice(0, 5)); // Get last 5 transactions

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Welcome back, {user?.name}!</h1>
      
      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-green-800">Total Income</h3>
          <p className="text-2xl font-bold text-green-600">${stats.totalIncome.toFixed(2)}</p>
        </div>
        
        <div className="bg-red-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-red-800">Total Expenses</h3>
          <p className="text-2xl font-bold text-red-600">${stats.totalExpenses.toFixed(2)}</p>
        </div>
        
        <div className={`p-6 rounded-lg shadow ${stats.netAmount >= 0 ? 'bg-blue-100' : 'bg-orange-100'}`}>
          <h3 className="text-lg font-semibold">Net Amount</h3>
          <p className={`text-2xl font-bold ${stats.netAmount >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
            ${stats.netAmount.toFixed(2)}
          </p>
        </div>
        
        <div className="bg-purple-100 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-purple-800">Transactions</h3>
          <p className="text-2xl font-bold text-purple-600">{stats.transactionCount}</p>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-2xl font-bold mb-4">Recent Transactions</h2>
        {recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((transaction) => (
                  <tr key={transaction._id} className="border-b">
                    <td className="px-4 py-2">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{transaction.description}</td>
                    <td className="px-4 py-2">{transaction.category}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-sm ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td className={`px-4 py-2 text-right font-semibold ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${transaction.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No transactions yet. Start by adding your first transaction!</p>
        )}
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.categoryBreakdown).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Category Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(stats.categoryBreakdown).map(([category, data]) => (
              <div key={category} className="border p-4 rounded">
                <h3 className="font-semibold text-lg">{category}</h3>
                <div className="mt-2">
                  <p className="text-green-600">Income: ${data.income.toFixed(2)}</p>
                  <p className="text-red-600">Expenses: ${data.expenses.toFixed(2)}</p>
                  <p className="font-semibold">
                    Net: ${(data.income - data.expenses).toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
