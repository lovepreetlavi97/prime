'use client';

import React, { useState } from 'react';
import { 
  Download, 
  MoreHorizontal, 
  Filter, 
  ArrowUpDown, 
  Eye, 
  RefreshCcw, 
  CheckCircle, 
  XOctagon, 
  ExternalLink,
  History,
  FileText
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface Transaction {
  id: string;
  orderId: string;
  userName: string;
  userEmail: string;
  plan: string;
  cycle: 'Monthly' | 'Yearly';
  amount: number;
  gst: number;
  total: number;
  gateway: string;
  status: 'Success' | 'Failed' | 'Pending' | 'Refunded';
  date: string;
  expiry: string;
}

const mockTransactions: Transaction[] = [
  {
    id: 'TXN-9821-XP',
    orderId: 'order_PY7v2Z18',
    userName: 'Rahul Sharma',
    userEmail: 'rahul@gmail.com',
    plan: 'VIP Gold',
    cycle: 'Monthly',
    amount: 1999,
    gst: 359.82,
    total: 2358.82,
    gateway: 'Razorpay',
    status: 'Success',
    date: '2024-04-20 12:30',
    expiry: '2024-05-20'
  },
  {
    id: 'TXN-7732-AL',
    orderId: 'order_KL8n9M32',
    userName: 'Anjali Gupta',
    userEmail: 'anjali.g@outlook.com',
    plan: 'Institutional',
    cycle: 'Yearly',
    amount: 49999,
    gst: 8999.82,
    total: 58998.82,
    gateway: 'Stripe',
    status: 'Success',
    date: '2024-04-20 10:45',
    expiry: '2025-04-20'
  }
];

export function TransactionTable() {
  const [selectedTxn, setSelectedTxn] = useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Failed': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'Pending': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Refunded': return 'bg-slate-50 text-slate-600 border-slate-100';
      default: return 'bg-slate-50 text-slate-600';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input 
            type="text" 
            placeholder="Search by ID, User, or Email..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <Filter size={16} /> Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-100 hover:bg-indigo-700">
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
              <th className="px-6 py-4">Transaction ID</th>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Plan & Cycle</th>
              <th className="px-6 py-4 text-right">Amount (Gross)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Gateway</th>
              <th className="px-6 py-4">Date & Time</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {mockTransactions.map((txn) => (
              <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4">
                  <span className="text-xs font-mono font-bold text-slate-600">{txn.id}</span>
                  <div className="text-[10px] text-slate-400 font-medium">OID: {txn.orderId}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-bold text-slate-800">{txn.userName}</div>
                  <div className="text-[10px] text-slate-400">{txn.userEmail}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-md">
                      {txn.plan}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{txn.cycle}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="text-sm font-black text-slate-800">₹{txn.total.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">GST: ₹{txn.gst}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border",
                    getStatusColor(txn.status)
                  )}>
                    {txn.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs font-bold text-slate-600">{txn.gateway}</td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500 whitespace-nowrap">{txn.date}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Invoice">
                      <FileText size={16} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs font-bold text-slate-500">
        <div>Showing 1-10 of 1,280 transactions</div>
        <div className="flex items-center gap-2">
           <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 transition-colors disabled:opacity-50">Prev</button>
           <button className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-indigo-400 transition-colors">Next</button>
        </div>
      </div>
    </div>
  );
}
