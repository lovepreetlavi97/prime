'use client';

import React from 'react';
import { TransactionTable } from '@/components/admin/TransactionTable';
import { 
  Calendar, 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Download,
  IndianRupee,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { StatCard } from '@/components/admin/StatCard';

export default function TransactionsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transaction Management</h1>
          <p className="text-slate-500 text-sm">Full ledger of all payments, refunds, and subscription renewals.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
            <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 rounded-lg">Today</button>
            <button className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-600 rounded-lg">This Month</button>
            <button className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 rounded-lg">Custom</button>
          </div>
        </div>
      </div>

      {/* Quick Summary Cards for Transactions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Successful Txns" value="1,420" icon={ShieldCheck} color="emerald" trend={{ value: 4, isUp: true }} />
        <StatCard title="Failed Attempts" value="82" icon={ArrowRightLeft} color="rose" trend={{ value: 12, isUp: false }} />
        <StatCard title="Avg. Order Value" value="₹3,450" icon={IndianRupee} color="blue" />
        <StatCard title="Refunds Initiated" value="12" icon={ClipboardList} color="amber" />
      </div>

      {/* Main Table Section */}
      <TransactionTable />

      {/* Policy and Alerts (Security Section) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-indigo-600 rounded-2xl p-8 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-lg shadow-indigo-100">
            <div>
               <h3 className="text-xl font-bold mb-2">Automated Fraud Detection</h3>
               <p className="text-indigo-100 text-sm opacity-80 max-w-md">Our system automatically masks sensitive user information and flags suspicious transaction patterns. Ensure you have proper clearance before initiating bulk refunds.</p>
            </div>
            <button className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-slate-50 transition-colors">
               View Security Logs
            </button>
         </div>

         <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
            <h4 className="font-bold text-slate-800 mb-4">Export Options</h4>
            <div className="space-y-2">
               <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                  <span className="text-xs font-bold text-slate-600">Monthly Reconciliation (PDF)</span>
                  <Download size={14} className="text-slate-300 group-hover:text-indigo-500" />
               </button>
               <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                  <span className="text-xs font-bold text-slate-600">Tax/GST Report (Excel)</span>
                  <Download size={14} className="text-slate-300 group-hover:text-indigo-500" />
               </button>
               <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-colors group">
                  <span className="text-xs font-bold text-slate-600">Bank Statement Sync</span>
                  <ArrowRightLeft size={14} className="text-slate-300 group-hover:text-indigo-500" />
               </button>
            </div>
         </div>
      </div>
    </div>
  );
}
