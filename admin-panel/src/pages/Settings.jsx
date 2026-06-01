import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setActiveTab, addAuditLog } from '../store/slices/adminSlice';
import { GlassCard } from '../components/GlassCard';
import { Save, AlertOctagon } from 'lucide-react';

const Toggle = ({ checked, onChange, color = 'amber' }) => {
  const colorClasses = {
    amber: 'bg-[#D4AF37] shadow-[0_0_12px_rgba(212,175,55,0.35)] border-[#D4AF37]/35',
    cyan: 'bg-[#00C2FF] shadow-[0_0_12px_rgba(0,194,255,0.35)] border-[#00C2FF]/35',
    red: 'bg-[#EF4444] shadow-[0_0_12px_rgba(239,68,68,0.35)] border-[#EF4444]/35',
  };

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-all duration-300 ease-in-out outline-none ${
        checked ? colorClasses[color] : 'bg-[#0D0D12] border-white/10'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-[18px] w-[18px] transform rounded-full transition duration-300 ease-in-out mt-[2px] ml-[2px] ${
          checked ? 'translate-x-5 bg-black' : 'translate-x-0 bg-[#4B4B52]'
        }`}
      />
    </button>
  );
};

export default function Settings() {
  const dispatch = useDispatch();
  const adminUser = useSelector((state) => state.admin.adminUser);

  useEffect(() => {
    dispatch(setActiveTab('settings'));
  }, [dispatch]);

  const [maintenance, setMaintenance] = useState(false);
  const [pingRate, setPingRate] = useState(10);
  const [aiTemp, setAiTemp] = useState(0.3);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [instagramAutoPost, setInstagramAutoPost] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      dispatch(addAuditLog({ 
        _id: Math.random().toString(36).substring(7),
        adminName: adminUser?.name || 'Admin', 
        action: 'UPDATE_SYSTEM_SETTINGS', 
        details: `Updated parameters: Maintenance=${maintenance}, Ping=${pingRate}s, AITemp=${aiTemp}`,
        timestamp: new Date().toISOString()
      }));
      alert('Global ecosystem settings applied successfully!');
    }, 1000);
  };

  return (
    <div className="space-y-6 select-none">
      <div className="space-y-1">
        <h2 className="text-3xl font-black text-white uppercase italic tracking-tight">
          SYSTEM <span className="text-[#D4AF37]">SETTINGS</span>
        </h2>
        <p className="text-[10px] font-black text-[#71717A] uppercase tracking-[4px]">
          Global Platform Rules, Maintenance Modes & Algorithmic Configurations
        </p>
      </div>

      <div className="max-w-3xl">
        <GlassCard title="Global Configuration Console" hasGlow={true}>
          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            {/* Maintenance Mode Option */}
            <div className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 flex justify-between items-center">
              <div className="space-y-1 pr-4">
                <div className="flex items-center gap-2 text-xs font-black text-red-500 uppercase tracking-tight">
                  <AlertOctagon size={14} />
                  Emergency Maintenance Mode
                </div>
                <p className="text-[10px] text-[#71717A] font-bold">
                  Toggle this to lock trade inputs and display a maintenance screen on mobile/website client applications.
                </p>
              </div>

              <Toggle 
                checked={maintenance}
                onChange={setMaintenance}
                color="red"
              />
            </div>

            {/* Slider configuration values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WS Heartbeat Ping rate */}
              <div className="space-y-2.5">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1 flex justify-between">
                  <span>WEBSOCKET HEARTBEAT INTERVAL</span>
                  <span className="text-white">{pingRate} Seconds</span>
                </label>
                <input 
                  type="range"
                  min={5}
                  max={60}
                  value={pingRate}
                  onChange={(e) => setPingRate(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-white/10 hover:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#D4AF37] transition-all duration-200 outline-none"
                />
              </div>

              {/* AI Generation temperature */}
              <div className="space-y-2.5">
                <label className="text-[9px] font-black uppercase tracking-[1.5px] text-[#71717A] pl-1 flex justify-between">
                  <span>AI MODEL TEMPERATURE BIAS</span>
                  <span className="text-white">{(aiTemp).toFixed(1)} Temp</span>
                </label>
                <input 
                  type="range"
                  min={0}
                  max={1}
                  step={0.1}
                  value={aiTemp}
                  onChange={(e) => setAiTemp(parseFloat(e.target.value))}
                  className="w-full h-1.5 bg-white/10 hover:bg-white/20 rounded-lg appearance-none cursor-pointer accent-[#00C2FF] transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Boolean switch rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="flex justify-between items-center py-2.5 border-b border-white/[0.03]">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-white uppercase tracking-tight">Sound Alerts Notification</span>
                  <span className="text-[9px] text-[#71717A] block">Play custom signals sounds on mobile alerts</span>
                </div>
                <Toggle 
                  checked={soundAlerts}
                  onChange={setSoundAlerts}
                  color="amber"
                />
              </div>

              <div className="flex justify-between items-center py-2.5 border-b border-white/[0.03]">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-white uppercase tracking-tight">Automated IG Publishing</span>
                  <span className="text-[9px] text-[#71717A] block">Automatically post top closed signals to Instagram feed</span>
                </div>
                <Toggle 
                  checked={instagramAutoPost}
                  onChange={setInstagramAutoPost}
                  color="amber"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full h-12 rounded-xl bg-[#D4AF37] hover:bg-[#cfa52f] text-black font-black uppercase text-[10px] tracking-[2px] active:scale-[0.98] transition-all duration-300 shadow-[0_4px_12px_rgba(212,175,55,0.15)] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Save size={12} />
              {saving ? 'APPLYING CONFIGS...' : 'SAVE SYSTEM CONFIGURATIONS'}
            </button>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
