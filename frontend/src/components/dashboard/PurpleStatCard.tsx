import { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PurpleStatCardProps {
  title: string;
  value: string;
  subtext: string;
  gradient: 'orange' | 'blue' | 'green';
  icon?: LucideIcon;
  className?: string;
}

export const PurpleStatCard = ({ title, value, subtext, gradient, icon: Icon, className }: PurpleStatCardProps) => {
  const gradientClass = {
    orange: 'bg-gradient-to-r from-[#ffbf96] to-[#fe7096]',
    blue: 'bg-gradient-to-r from-[#90caf9] to-[#047edf]',
    green: 'bg-gradient-to-r from-[#84d9d2] to-[#07cdae]',
  }[gradient];

  return (
    <div className={cn("relative overflow-hidden rounded-xl p-6 text-white shadow-lg transition-transform hover:scale-105", gradientClass, className)}>
      {/* Decorative Circles matching image */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20 blur-xl"></div>
      <div className="absolute right-10 bottom-0 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>

      <div className="relative z-10 flex flex-col h-full justify-between min-h-[140px]">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-medium opacity-90">{title}</h3>
          {Icon && <Icon className="h-6 w-6 opacity-80" />}
        </div>
        
        <div>
          <h2 className="text-3xl font-bold mb-1">{value}</h2>
          <p className="text-sm font-medium opacity-80">{subtext}</p>
        </div>
      </div>
    </div>
  );
};
