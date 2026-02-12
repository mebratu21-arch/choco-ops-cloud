import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  description?: string;
  color?: 'primary' | 'secondary' | 'accent' | 'green' | 'red' | 'blue';
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  trend,
  description,
  color = 'primary',
  className
}) => {

  const colorMap: Record<string, { bg: string, text: string, icon: string, shadow: string, border: string, glow: string }> = {
    primary: { 
      bg: 'bg-chocolate-600/20', 
      text: 'text-chocolate-100', 
      icon: 'text-amber-400', 
      shadow: 'shadow-chocolate-500/20',
      border: 'border-chocolate-400/30',
      glow: 'group-hover:bg-amber-500/20'
    },
    secondary: { 
      bg: 'bg-gold-500/20', 
      text: 'text-gold-50', 
      icon: 'text-gold-400', 
      shadow: 'shadow-gold-500/20',
      border: 'border-gold-400/30',
      glow: 'group-hover:bg-gold-500/20'
    },
    accent: { 
      bg: 'bg-amber-500/20', 
      text: 'text-amber-50', 
      icon: 'text-amber-400', 
      shadow: 'shadow-amber-500/20',
      border: 'border-amber-400/30',
      glow: 'group-hover:bg-amber-500/20'
    },
    green: { 
      bg: 'bg-emerald-500/20', 
      text: 'text-emerald-50', 
      icon: 'text-emerald-400', 
      shadow: 'shadow-emerald-500/20',
      border: 'border-emerald-400/30',
      glow: 'group-hover:bg-emerald-500/20'
    },
    red: { 
      bg: 'bg-rose-500/20', 
      text: 'text-rose-50', 
      icon: 'text-rose-400', 
      shadow: 'shadow-rose-500/20',
      border: 'border-rose-400/30',
      glow: 'group-hover:bg-rose-500/20'
    },
    blue: { 
      bg: 'bg-blue-500/20', 
      text: 'text-blue-50', 
      icon: 'text-blue-400', 
      shadow: 'shadow-blue-500/20',
      border: 'border-blue-400/30',
      glow: 'group-hover:bg-blue-500/20'
    },
  };

  const theme = colorMap[color];

  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.02 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative overflow-hidden group p-1 w-full rounded-[2.5rem] transition-all duration-500",
        "bg-gradient-to-br from-white/10 via-transparent to-white/5 shadow-2xl",
        className
      )}
    >
      {/* Inner Boundry with blur */}
      <div className="relative h-full w-full bg-[#1A0F0A]/80 backdrop-blur-3xl rounded-[2.4rem] p-8 border border-white/10 overflow-hidden">
        
        {/* Animated Glow Background */}
        <div className={cn(
          "absolute -top-24 -right-24 w-64 h-64 rounded-full blur-[80px] transition-all duration-1000 opacity-20",
          theme.glow
        )} />

        <div className="relative z-10 flex flex-col h-full justify-between">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 shadow-lg",
              theme.bg, theme.border, "group-hover:rotate-12 group-hover:scale-110"
            )}>
              <Icon className={cn("w-8 h-8", theme.icon)} />
            </div>
            
            {trend && (
              <div className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full border-2 text-[11px] font-black uppercase tracking-tighter",
                trend.positive
                  ? "text-emerald-400 border-emerald-500/20 bg-emerald-500/10"
                  : "text-rose-400 border-rose-500/20 bg-rose-500/10"
              )}>
                {trend.value}%
              </div>
            )}
          </div>

          {/* Value Section */}
          <div className="mt-10 space-y-3">
            <h3 className="text-xs font-black text-chocolate-300 uppercase tracking-[0.4em] leading-none opacity-60">
              {title}
            </h3>
            <div className="flex items-baseline gap-2">
              <h2 className="text-5xl font-black text-white tracking-tight drop-shadow-2xl">
                {value}
              </h2>
            </div>
            
            {description && (
              <div className="pt-4 flex items-center gap-2 border-t border-white/5">
                <div className={cn("w-1.5 h-1.5 rounded-full", theme.icon.replace('text', 'bg'))} />
                <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                  {description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default StatsCard;
