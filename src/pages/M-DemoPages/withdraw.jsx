import React, { useState, useEffect } from 'react';
import Card from '../../components/Cards/Cards';
import { AlertTriangle, Eye, EyeOff } from 'lucide-react';
import telebirrLogo from '/Telebirr.png';
import cbeBirrLogo from '/cbebirr.png';
import chapa from "/chapa.avif"

const BalancePage = ({ requesterType = 'Restaurant' }) => {
  const [balance, setBalance] = useState(null);
  const [showBalance, setShowBalance] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [historyInfo, setHistoryInfo] = useState({ requesterType, totalBalance: null });
  const [bankId, setBankId] = useState('');
  const baseUrl = 'https://api.bahirandelivery.cloud/';
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const SESSION_STORAGE_KEY = 'bahiran-withdraw-init';
  const BANK_LOGOS = {
    telebirr: telebirrLogo,
    cbebirr: cbeBirrLogo,
  };

  const getCachedBalance = () => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch (cacheErr) {
      console.warn('Failed to parse cached balance data', cacheErr);
      return null;
    }
  };

  const cacheBalance = (data) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch (cacheErr) {
      console.warn('Failed to cache balance data', cacheErr);
    }
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
  const fetchBalance = async (forceRefresh = false) => {
    if (!forceRefresh) {
      const cachedData = getCachedBalance();
      if (cachedData) {
        setBalance(cachedData);
        return;
      }
    }
    try {
      const response = await fetch(`${baseUrl}api/v1/balance/initialize-withdraw`, { headers });
      if (!response.ok) throw new Error('Failed to fetch balance');
      const result = await response.json();
      if (result.status === 'success') {
        setBalance(result.data);
        cacheBalance(result.data);
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
      console.log(result);
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
    const payload = {
      amount: parseFloat(amountInput),
      bankId: bankId
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${baseUrl}/api/v1/balance/withdraw`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      // console.log(response);
      // console.log(payload);
      if (amountInput > balance.balance) {
        setError('Insufficient balance');
        return;
      }
      if (!response.ok) throw new Error('Failed to process withdrawal');
      const result = await response.json();
      if (result.status === 'success') {
        setMessage('Withdrawal request submitted successfully.');
        setAmountInput('');
        // Refetch balance instead of reloading
        await fetchBalance(true);
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

  const banks = balance?.banks || [];
  const getBankLogo = (bank) => {
    const slug = bank?.slug?.toLowerCase();
    if (slug && BANK_LOGOS[slug]) {
      return BANK_LOGOS[slug];
    }
    return null;
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
      'APPROVED': 'bg-blue-100 text-green-800',
      'REJECTED': 'bg-red-100 text-gray-800',
      'SUCCESS': 'bg-green-100 text-gray-800'
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
    <div className="p-6 pt-3 bg-[#f9f5f0] font-noto h-[calc(100vh-65px)] overflow-y-auto ">
      <div className="max-w-7xl mx-auto">
        {/* <h1 className="text-xl font-semibold mb-4">Balance Dashboard - {requesterType}</h1> */}
        
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
                  {showBalance ? <Eye /> : <EyeOff />}
                </button>
              </div>
              <div className="text-2xl font-bold">
                {showBalance ? '**** **** **** ' : `${parseDecimal(balance.balance).toLocaleString()} ${balance.currency || 'ETB'}`}
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
          <form onSubmit={handleWithdraw} className="flex flex-col gap-3">
            <div className="flex  gap-2 lg:w-[500px] items-center">

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
                className="px-5 py-2 bg-[#e0cda9] text-primary rounded-md hover:bg-[#deb770] disabled:opacity-50 disabled:cursor-not-allowed w-fit flex items-center justify-center gap-2"
              >
                {loading ? 'Processing...' : 'Withdraw'} 
              </button><img src={chapa} alt="bank logo" className="h-28 w-auto " />
            </div>
             <div className="flex flex-wrap gap-6">
               {banks.map((bank) => {
                 const isSelected = String(bankId) === String(bank.id);
                 const logo = getBankLogo(bank) || bank.logo;
                 return (
                   <button
                     type="button"
                     key={bank.id}
                     onClick={() => setBankId(String(bank.id))}
                     className={`flex items-center gap-3  rounded-lg hover:scale-95  transition-all active:scale-100 ${
                       isSelected
                         ? 'shadow-xl scale-110 shadow-black/20 border-2 border-[#deb770] '
                         : 'border-gray-200 hover:border-[#deb770]'
                     }`}
                   >
                     {logo ? (
                       <img src={logo} alt={`${bank.name} logo`} className="h-12 w-auto rounded-lg bg-[#ffffff]  " />
                     ) : (
                       <span className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-xs font-semibold text-gray-500">
                         {bank.name?.[0] || '?'}
                       </span>
                     )}
                     {/* <span className="text-sm font-medium text-gray-700">{bank.name}</span> */}
                   </button>
                 );
               })}
             </div>
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
                <tbody className="bg-white divide-y divide-gray-200 ">
                  {transactions.map((tx, index) => (
                    <tr key={index} className="hover:bg-gray-50 ">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(tx.createdAt || tx.date || 'N/A')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{tx.type || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.netAmount != null ? `${formatAmount(tx.netAmount)} ${tx.currency || 'ETB'}` : 'N/A'}
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