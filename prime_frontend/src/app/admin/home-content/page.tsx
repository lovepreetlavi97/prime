'use client';

import React, { useState, useEffect } from 'react';
import { API_URL } from '@/config';
import { Save, Plus, Trash2, ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HomeContentAdmin() {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const res = await fetch(`${API_URL}/home-content`);
      const data = await res.json();
      setContent(data);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/home-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (res.ok) setMessage('✅ Content updated successfully!');
      else setMessage('❌ Error updating content');
    } catch (err) {
      setMessage('❌ Connection error');
    } finally {
      setSaving(false);
    }
  };

  const updateList = (field: string, index: number, value: string) => {
    const newList = [...content[field]];
    newList[index] = value;
    setContent({ ...content, [field]: newList });
  };

  const addListItem = (field: string) => {
    setContent({ ...content, [field]: [...content[field], ''] });
  };

  const removeListItem = (field: string, index: number) => {
    const newList = content[field].filter((_: any, i: number) => i !== index);
    setContent({ ...content, [field]: newList });
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#0B0B0F] text-white p-8 pb-40">
      <div className="max-w-4xl mx-auto space-y-12">
        
        <div className="flex justify-between items-center">
          <Link href="/admin" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all text-sm font-bold uppercase tracking-widest">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="bg-[#D4AF37] text-black px-8 py-3 rounded-xl font-black text-[10px] uppercase tracking-[4px] flex items-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Save Changes
          </button>
        </div>

        {message && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl text-center text-sm font-bold tracking-widest uppercase">
            {message}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* HERO SECTION */}
          <Section title="Hero Content">
            <Input label="Headline" value={content.hero.headline} onChange={(v: string) => setContent({...content, hero: {...content.hero, headline: v}})} />
            <Textarea label="Subtext" value={content.hero.subtext} onChange={(v: string) => setContent({...content, hero: {...content.hero, subtext: v}})} />
            <Input label="CTA Text" value={content.hero.cta} onChange={(v: string) => setContent({...content, hero: {...content.hero, cta: v}})} />
          </Section>

          {/* WAITING STATE */}
          <ListSection 
            title="Waiting Phrases" 
            items={content.waitingState} 
            onChange={(i: number, v: string) => updateList('waitingState', i, v)}
            onAdd={() => addListItem('waitingState')}
            onRemove={(i: number) => removeListItem('waitingState', i)}
          />

          {/* ANTICIPATION & LAST SIGNAL */}
          <Section title="Social Proof & Urgency">
            <Input label="Anticipation Strip" value={content.anticipation} onChange={(v: string) => setContent({...content, anticipation: v})} />
            <Input label="Last Signal Result" value={content.lastSignal} onChange={(v: string) => setContent({...content, lastSignal: v})} />
          </Section>

          {/* TRUST BLOCK */}
          <Section title="Trust Statement">
            <Textarea label="Trust Content" value={content.trust} onChange={(v: string) => setContent({...content, trust: v})} />
          </Section>

          {/* GUIDANCE */}
          <ListSection 
            title="Discipline Guidance" 
            items={content.guidance} 
            onChange={(i: number, v: string) => updateList('guidance', i, v)}
            onAdd={() => addListItem('guidance')}
            onRemove={(i: number) => removeListItem('guidance', i)}
          />

          {/* UPGRADE SECTION */}
          <Section title="Upgrade Promo">
            <Input label="Headline" value={content.upgrade.headline} onChange={(v: string) => setContent({...content, upgrade: {...content.upgrade, headline: v}})} />
            <Textarea label="Subtext" value={content.upgrade.subtext} onChange={(v: string) => setContent({...content, upgrade: {...content.upgrade, subtext: v}})} />
            <Input label="CTA Text" value={content.upgrade.cta} onChange={(v: string) => setContent({...content, upgrade: {...content.upgrade, cta: v}})} />
          </Section>

           {/* LOCKED MESSAGE */}
           <Section title="Gating Logic">
            <Textarea label="Locked Content Message" value={content.locked} onChange={(v: string) => setContent({...content, locked: v})} />
          </Section>

          {/* MICRO LINES */}
          <ListSection 
            title="Micro Psychology" 
            items={content.microLines} 
            onChange={(i: number, v: string) => updateList('microLines', i, v)}
            onAdd={() => addListItem('microLines')}
            onRemove={(i: number) => removeListItem('microLines', i)}
          />

        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: any) {
  return (
    <div className="bg-[#14141A] border border-[#27272A] p-8 rounded-3xl space-y-6">
      <h3 className="text-[10px] font-black uppercase tracking-[4px] text-zinc-500">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ListSection({ title, items, onChange, onAdd, onRemove }: any) {
  return (
    <div className="bg-[#14141A] border border-[#27272A] p-8 rounded-3xl space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-[10px] font-black uppercase tracking-[4px] text-zinc-500">{title}</h3>
        <button onClick={onAdd} className="text-[#D4AF37] hover:bg-[#D4AF37]/10 p-1 rounded-lg transition-all"><Plus size={16} /></button>
      </div>
      <div className="space-y-3">
        {items.map((item: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input 
              value={item} 
              onChange={(e) => onChange(i, e.target.value)} 
              className="flex-1 bg-black/50 border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all"
            />
            <button onClick={() => onRemove(i)} className="text-red-500/50 hover:text-red-500 transition-all"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase tracking-widest text-[#A1A1AA]">{label}</label>
      <input 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full bg-black/50 border border-[#27272A] rounded-xl px-4 py-3 text-sm font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all"
      />
    </div>
  );
}

function Textarea({ label, value, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[9px] font-black uppercase tracking-widest text-[#A1A1AA]">{label}</label>
      <textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        rows={4}
        className="w-full bg-black/50 border border-[#27272A] rounded-xl px-4 py-4 text-sm font-bold text-white focus:outline-none focus:border-[#D4AF37] transition-all resize-none"
      />
    </div>
  );
}
