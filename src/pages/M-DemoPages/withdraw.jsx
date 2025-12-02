import React, { useState, useEffect } from 'react';
import Card from '../../components/Cards/Cards';
import { AlertTriangle , Eye, EyeOff} from 'lucide-react';

const BalancePage = ({ requesterType = 'Restaurant' }) => {
  const [balance, setBalance] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [historyInfo, setHistoryInfo] = useState({ requesterType, totalBalance: null });

  const baseUrl = 'https://api.bahirandelivery.cloud/';
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  const parseDecimal = (value) => {
    if (value && typeof value === 'object' && value.$numberDecimal != null) {
      return parseFloat(value.$numberDecimal);
    }
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value);
    return 0;
  };

  // Fetch balance
  const fetchBalance = async () => {
    try {
      const response = await fetch(`${baseUrl}/api/v1/balance`, { headers });
      if (!response.ok) throw new Error('Failed to fetch balance');
      const result = await response.json();
      console.log(result);
      if (result.status === 'success') {
        setBalance(result.data);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (token) fetchBalance();
  }, [token]);

  // (Manager page) No withdrawal history fetch here; admin-only feature

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${baseUrl}/api/v1/balance/history`, {
        headers
      });
      if (!response.ok) throw new Error('Failed to fetch transaction history');
      const result = await response.json();
      const list = Array.isArray(result?.transactions) ? result.transactions : Array.isArray(result?.data) ? result.data : [];
      if (Array.isArray(list)) {
        const sortedTransactions = list.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
        setTransactions(sortedTransactions);
        // setMessage('Transaction history loaded successfully.');
      }
      const infoType = result?.requesterType || requesterType;
      const infoBalance = result?.totalBalance != null ? parseDecimal(result.totalBalance) : null;
      setHistoryInfo({ requesterType: infoType, totalBalance: infoBalance });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!amountInput || parseFloat(amountInput) <= 0) {
      setError('Please enter a valid amount.');
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${baseUrl}/api/v1/balance/withdraw`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ amount: parseFloat(amountInput) })
      });
      if (!response.ok) throw new Error('Failed to process withdrawal');
      const result = await response.json();
      if (result.status === 'success') {
        setMessage('Withdrawal request submitted successfully.');
        setAmountInput('');
        // Refetch balance instead of reloading
        await fetchBalance();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amountObj) => {
    return parseDecimal(amountObj).toLocaleString();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-red-100 text-red-800'
    };
    return `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusMap[status] || 'bg-gray-100 text-gray-800'}`;
  };

  if (loading && !balance) {
    return (
      <div className="p-6 pt-3 bg-[#f4f1e9] font-noto h-[calc(100vh-65px)] flex items-center justify-center">
        <Card>
          <div className="text-center py-6 text-placeholderText">Loading...</div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 pt-3 bg-[#f4f1e9] font-noto h-[calc(100vh-65px)] overflow-y-auto ">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-xl font-semibold mb-4">Balance Dashboard - {requesterType}</h1>

        {/* Balance Card */}
        {balance && (
          <Card >
            <div className="mb-6">

            <div className="flex justify-between items-center mb-4 gap-16">
              <h2 className="text-lg font-semibold">Current Balance</h2>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="text-xs text-gray-600 hover:text-gray-800"
              >
                {/* {showBalance ? 'Hide' : 'Show'} */}
                {showBalance ?<Eye />  :<EyeOff /> }
              </button>
            </div>
            <div className="text-2xl font-bold">
              {showBalance ? '**** **** **** ' :  `${parseDecimal(balance.amount).toLocaleString()} ${balance.currency}`}
            </div>
            </div>
          </Card>
        )}

        {/* Messages */}
        {message && (
          <Card className="mb-">
            <div className="text-green-700 text-sm">{message}</div>
          </Card>
        )}
        {error && (
          <Card className="mb-4">
            <div className="text-red-600 text-sm">{error}</div>
          </Card>
        )}

        {/* Withdraw Form */}
        <Card className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Request Withdrawal</h2>
          <form onSubmit={handleWithdraw} className="flex gap-3">
            <input
              type="number"
              placeholder="Enter amount"
              value={amountInput}
              onChange={(e) => setAmountInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-[#e0cda9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#deb770]"
              min="0"
              step="0.01"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !amountInput}
              className="px-5 py-2 bg-[#e0cda9] text-primary rounded-md hover:bg-[#deb770] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Withdraw'}
            </button>
          </form>
        </Card>

        {/* Transaction History Button and Table */}
        <div className="mb-6">
          <button
            onClick={fetchTransactionHistory}
            disabled={loading}
            className="mb-4 px-4 py-2 bg-[#e0cda9] text-primary rounded-md hover:bg-[#deb770] disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Fetch Transaction History'}
          </button>
          {transactions.length > 0 && (
            <Card className="overflow-hidden">
              <h3 className="px-6 py-3 bg-gray-50 text-base font-medium">Transaction History</h3>
              <div className="px-6 py-2 flex items-center gap-6 text-xs text-gray-600">
                <span>
                  Type: <span className="font-medium text-gray-800">{historyInfo.requesterType || requesterType}</span>
                </span>
                <span>
                  Total balance: <span className="font-medium text-gray-800">
                    {historyInfo.totalBalance != null ? `${historyInfo.totalBalance.toLocaleString()} ${balance?.currency || 'ETB'}` : '-'}
                  </span>
                </span>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((tx, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(tx.createdAt || tx.date || 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.type || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.amount != null ? `${formatAmount(tx.amount)} ${tx.currency || 'ETB'}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(tx.status || 'N/A')}>
                          {tx.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>

        {/* Withdrawal history section removed for manager page (admin-only feature) */}
      </div>
    </div>
  );
};

export default BalancePage;