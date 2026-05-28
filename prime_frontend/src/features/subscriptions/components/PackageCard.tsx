import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { useSubscriptionsStore } from '../store/useSubscriptionsStore';
import { CheckCircle2 } from 'lucide-react';

interface PackageCardProps {
  id: string;
  name: string;
  price: number;
  durationInDays: number;
  features: string[];
  badge?: string;
  isPopular?: boolean;
}

export const PackageCard: React.FC<PackageCardProps> = ({
  id,
  name,
  price,
  durationInDays,
  features,
  badge,
  isPopular,
}) => {
  const { buyPackage, loading } = useSubscriptionsStore();

  const handleBuy = async () => {
    try {
      await buyPackage(id);
      alert(`Success! You have subscribed to ${name}.`);
    } catch (err) {
      alert('Failed to subscribe. Please try again.');
    }
  };

  return (
    <Card 
      variant={isPopular ? 'solid' : 'glass'} 
      className={`relative overflow-hidden transition-transform duration-500 hover:scale-105 ${isPopular ? 'border-blue-500 shadow-blue-500/20' : ''}`}
    >
      {badge && (
        <div className="absolute top-4 right-[-35px] rotate-45 bg-blue-600 text-white text-[10px] font-bold py-1 px-10 shadow-lg">
          {badge}
        </div>
      )}

      <CardHeader className="text-center">
        <CardTitle className="text-2xl mb-1">{name}</CardTitle>
        <div className="flex items-center justify-center gap-1">
          <span className="text-4xl font-extrabold text-white">₹{price}</span>
          <span className="text-slate-400">/ {durationInDays} days</span>
        </div>
      </CardHeader>

      <CardContent className="mt-6">
        <ul className="space-y-3 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3 text-slate-300">
              <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleBuy}
          disabled={loading}
          className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
            isPopular 
              ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30' 
              : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Processing...' : 'Activate Now'}
        </button>
      </CardContent>
    </Card>
  );
};
