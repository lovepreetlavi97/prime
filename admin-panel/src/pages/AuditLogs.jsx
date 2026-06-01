import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab } from '../store/slices/adminSlice';
import { GlassCard } from '../components/GlassCard';
import { Search } from 'lucide-react';

export default function AuditLogs() {
  const dispatch = useDispatch();
  const auditLogs = useSelector((state) => state.admin.auditLogs);
  const [search, setSearch] = useState('');

  useEffect(() => {
    dispatch(setActiveTab('audit-logs'));
  }, [dispatch]);

  const filteredLogs = auditLogs.filter(log => {
    return (
      log.adminName.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          AUDIT <span className="text-[#D4AF37]">LOGS</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Administrative Security Auditing & Operations Log System
        </p>
      </div>

      <div className="space-y-4">
        {/* Search filter */}
        <div className="w-full md:max-w-md flex items-center gap-3 px-4 h-12 rounded-2xl bg-[#0A0D18]/65 border border-white/5 focus-within:border-[#D4AF37]/50 transition-all duration-300">
          <Search size={16} className="text-[#4B4B52]" />
          <input
            type="text"
            placeholder="Search by admin name or action..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow bg-transparent border-none text-white text-xs outline-none placeholder:text-white/20 tracking-wider font-bold"
          />
        </div>

        {/* Table of logs */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#71717A] font-black uppercase tracking-wider bg-white/[0.01]">
                  <th className="p-4 pl-6">TIMESTAMP</th>
                  <th className="p-4">ADMINISTRATOR</th>
                  <th className="p-4">ACTION STATUS</th>
                  <th className="p-4 pr-6">OPERATIONAL DETAILS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.02]">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-white/[0.01] transition-colors">
                      <td className="p-4 pl-6 text-[#71717A] font-bold">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="p-4 font-black text-white">
                        {log.adminName}
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] font-black tracking-widest px-2.5 py-1 rounded border ${
                          log.action.includes('BAN') || log.action.includes('DELETE')
                            ? 'bg-red-500/10 border-red-500/20 text-[#EF4444]'
                            : log.action.includes('CREATE') || log.action.includes('LOGIN')
                            ? 'bg-green-500/10 border-green-500/20 text-[#10B981]'
                            : 'bg-amber-500/10 border-amber-500/20 text-[#D4AF37]'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-4 text-[#A1A1AA] pr-6 font-medium">
                        {log.details}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-12 text-center text-[#71717A] uppercase font-black tracking-[4px]">
                      No Operations logs found matching filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
