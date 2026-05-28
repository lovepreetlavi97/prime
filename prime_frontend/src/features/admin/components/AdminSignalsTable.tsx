import React from 'react';
import { MoreVertical, CheckCircle, XCircle, AlertCircle, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

interface Signal {
  _id: string;
  symbol: string;
  type: string;
  entry: number;
  status: 'ACTIVE' | 'HOLD' | 'EXIT' | 'SL HIT' | 'TARGET HIT';
  createdAt: string;
}

export const AdminSignalsTable: React.FC<{ signals: Signal[]; onUpdateStatus: (id: string, status: string) => void }> = ({ signals, onUpdateStatus }) => {
  const statusColors = {
    'ACTIVE': 'text-green-400 bg-green-400/10 border-green-400/20',
    'HOLD': 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'EXIT': 'text-red-400 bg-red-400/10 border-red-400/20',
    'SL HIT': 'text-red-600 bg-red-600/10 border-red-600/20',
    'TARGET HIT': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  };

  return (
    <div className="bg-[#0f1218] border border-white/5 rounded-2xl overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-[#14181f] border-b border-white/5">
          <tr>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Pairs</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Entry</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Status</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest">Created At</th>
            <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {signals.map((signal) => (
            <tr key={signal._id} className="hover:bg-white/[0.02] transition-colors">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-400 font-bold text-xs border border-blue-600/20">
                    {signal.symbol[0]}
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-white">{signal.symbol}</span>
                    <span className="block text-[10px] text-slate-500 font-bold">{signal.type}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-sm font-medium text-slate-300">₹{signal.entry}</td>
              <td className="px-6 py-4">
                <span className={clsx("px-2 py-1 rounded text-[10px] font-black border", statusColors[signal.status])}>
                  {signal.status}
                </span>
              </td>
              <td className="px-6 py-4 text-xs text-slate-500">{new Date(signal.createdAt).toLocaleDateString()}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => onUpdateStatus(signal._id, 'TARGET HIT')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-green-400 hover:bg-green-400/5 transition-all text-xs flex items-center gap-1 border border-transparent hover:border-green-400/20"
                  >
                    <CheckCircle className="w-4 h-4" /> Hit
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(signal._id, 'EXIT')}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/5 transition-all text-xs flex items-center gap-1 border border-transparent hover:border-red-400/20"
                  >
                    <XCircle className="w-4 h-4" /> Exit
                  </button>
                  <div className="w-[1px] h-4 bg-white/5 mx-1" />
                  <button className="p-1.5 rounded-lg text-slate-600 hover:text-white transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
