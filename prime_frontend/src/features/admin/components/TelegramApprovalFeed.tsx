import React from 'react';
import { Card } from '@/components/ui/Card';
import { Check, X, FileText, Image as ImageIcon, Zap } from 'lucide-react';

interface PendingMessage {
  id: string;
  source: string;
  rawText: string;
  parsedData: any;
  timestamp: string;
  hasImage: boolean;
}

export const TelegramApprovalFeed: React.FC<{ messages: PendingMessage[]; onApprove: (id: string) => void; onReject: (id: string) => void }> = ({ messages, onApprove, onReject }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" /> Incoming Logic Streams
        </h3>
        <span className="text-[10px] bg-blue-600/10 text-blue-500 border border-blue-600/20 px-2 py-0.5 rounded font-black">
          {messages.length} PENDING
        </span>
      </div>

      {messages.map((msg) => (
        <Card key={msg.id} variant="glass" className="border-l-4 border-l-blue-600 hover:border-white/10 transition-all">
          <div className="flex gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-black bg-white/5 text-slate-400 px-2 py-1 rounded">
                  {msg.source}
                </span>
                <span className="text-[10px] text-slate-600 font-bold">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Raw Input</span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono leading-relaxed whitespace-pre-wrap">
                    {msg.rawText}
                  </p>
                </div>

                <div className="bg-blue-600/5 p-3 rounded-xl border border-blue-500/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">AI Parse</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                    <div className="text-slate-500">Symbol: <span className="text-white">{msg.parsedData?.symbol}</span></div>
                    <div className="text-slate-500">Entry: <span className="text-white">₹{msg.parsedData?.entry}</span></div>
                    <div className="text-slate-500">Type: <span className="text-white">{msg.parsedData?.type}</span></div>
                    <div className="text-slate-500">SL: <span className="text-white font-mono text-red-400">{msg.parsedData?.sl}</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 justify-center border-l border-white/5 pl-6">
              <button 
                onClick={() => onApprove(msg.id)}
                className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-xl shadow-green-600/20 hover:bg-green-500 transition-all"
                title="Approve & Broadcast"
              >
                <Check className="w-6 h-6" />
              </button>
              <button 
                onClick={() => onReject(msg.id)}
                className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                title="Reject"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
