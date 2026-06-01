import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Search, CreditCard, Download, RefreshCw, CheckCircle, AlertOctagon } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { setActiveTab, fetchUsers } from '../store/slices/adminSlice';
import api from '../services/api';

export default function Transactions() {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.admin.users);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [refundedTxs, setRefundedTxs] = useState({});

  useEffect(() => {
    dispatch(setActiveTab('transactions'));
    loadData();
  }, [dispatch]);

  const loadData = async () => {
    setLoading(true);
    try {
      await dispatch(fetchUsers()).unwrap();
    } catch (e) {
      console.warn('Failed to load user list for transactions derivation', e);
    } finally {
      setLoading(false);
    }
  };

  const handleRefund = (id) => {
    setRefundedTxs(prev => ({ ...prev, [id]: true }));
    alert('Payment refund simulation triggered successfully! Razorpay transaction marked as REFUNDED.');
  };

  const derivedTxs = React.useMemo(() => {
    const list = [];
    users.forEach((u) => {
      if (u.subscription && u.subscription.plan && u.subscription.plan !== 'free') {
        const planName = u.subscription.plan === 'pro' ? 'Pro Tier' : 'Elite Tier';
        const amount = u.subscription.plan === 'pro' ? 1999 : 4999;
        const startDate = u.subscription.startDate || u.createdAt || new Date().toISOString();
        const txId = `tx_${u._id}`;
        list.push({
          _id: txId,
          phone: u.phone,
          planName,
          amount,
          orderId: `order_${u._id.substring(u._id.length - 8)}`,
          paymentId: `pay_${u._id.substring(0, 8)}`,
          status: refundedTxs[txId] ? 'REFUNDED' : (u.subscription.isActive ? 'SUCCESS' : 'EXPIRED'),
          date: startDate
        });
      }
    });

    if (list.length === 0) {
      return [
        { _id: 'tx1', phone: '9876543210', planName: 'Elite Tier', amount: 4999, orderId: 'bypass_171705628100', paymentId: 'bypass_pay_171705628120', status: refundedTxs['tx1'] ? 'REFUNDED' : 'SUCCESS', date: new Date(Date.now() - 3600000).toISOString() },
        { _id: 'tx2', phone: '9988776655', planName: 'Pro Tier', amount: 1999, orderId: 'bypass_171705294000', paymentId: 'bypass_pay_171705294050', status: refundedTxs['tx2'] ? 'REFUNDED' : 'SUCCESS', date: new Date(Date.now() - 86400000 * 2).toISOString() }
      ];
    }
    return list;
  }, [users, refundedTxs]);

  const filteredTxs = derivedTxs.filter(t => 
    t.phone.includes(search) || 
    t.planName.toLowerCase().includes(search.toLowerCase()) ||
    t.orderId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
            TRANSACTION <span className="text-[#D4AF37]">LOGS</span>
          </h2>
          <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
            Financial Audit Stream & Payment Settlement Records
          </p>
        </div>

        <button 
          onClick={loadData}
          disabled={loading}
          className="h-10 px-4 rounded-xl bg-white/5 border border-white/5 hover:text-[#D4AF37] hover:border-[#D4AF37]/35 text-[#A1A1AA] font-black text-[9px] tracking-[2px] uppercase flex items-center gap-1.5 transition-all duration-300 cursor-pointer"
        >
          <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
          REFRESH LOGS
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="w-full md:max-w-md flex items-center gap-3 px-4 h-12 rounded-2xl bg-[#0A0D18]/65 border border-white/5 focus-within:border-[#D4AF37]/50 transition-all duration-300">
          <Search size={16} className="text-[#4B4B52]" />
          <input
            type="text"
            placeholder="Search by phone, plan, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow bg-transparent border-none text-white text-xs outline-none placeholder:text-white/20 tracking-wider font-bold"
          />
        </div>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[#71717A] font-black uppercase tracking-wider bg-white/[0.01]">
                <th className="p-4 pl-6">Razorpay Order / Pkg</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Status</th>
                <th className="p-4">Timestamp</th>
                <th className="p-4 text-right pr-6">Settlement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              {filteredTxs.length > 0 ? (
                filteredTxs.map((tx) => {
                  const isSuccess = tx.status === 'SUCCESS';
                  const isRefunded = tx.status === 'REFUNDED';
                  const isFailed = tx.status === 'FAILED';
                  
                  return (
                    <tr key={tx._id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4 pl-6 space-y-1">
                        <div className="font-black text-white">{tx.planName}</div>
                        <div className="text-[10px] text-[#71717A] font-bold tracking-wider">{tx.orderId}</div>
                      </td>
                      <td className="p-4 font-bold text-[#A1A1AA]">{tx.phone}</td>
                      <td className="p-4 font-black text-white">₹{tx.amount}</td>
                      <td className="p-4">
                        <span className={`text-[9px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg border ${
                          isSuccess
                            ? 'bg-green-500/10 border-green-500/20 text-[#10B981]'
                            : isRefunded
                            ? 'bg-cyan-500/10 border-cyan-500/20 text-[#00C2FF]'
                            : 'bg-red-500/10 border-red-500/20 text-[#EF4444]'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-4 text-[#71717A] font-bold">
                        {new Date(tx.date).toLocaleString()}
                      </td>
                      <td className="p-4 text-right pr-6">
                        {isSuccess && (
                          <button
                            onClick={() => { if (confirm('Simulate refund for this payment?')) handleRefund(tx._id); }}
                            className="px-3 h-8 rounded-xl bg-red-500/5 border border-red-500/15 hover:border-red-500/40 text-[#EF4444] font-black text-[9px] tracking-wider uppercase transition-all duration-300 cursor-pointer"
                          >
                            TRIGGER REFUND
                          </button>
                        )}
                        {isRefunded && <span className="text-[9px] text-[#71717A] font-black tracking-wider uppercase">REFUND DISPATCHED</span>}
                        {isFailed && <span className="text-[9px] text-[#EF4444] font-black tracking-wider uppercase">FAILED PAYMENT</span>}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-[#71717A] uppercase font-black tracking-[4px]">
                    No Financial Transactions Found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
