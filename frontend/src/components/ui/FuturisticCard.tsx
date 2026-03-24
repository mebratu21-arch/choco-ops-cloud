import React from 'react';

interface FuturisticCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: 'gold' | 'blue' | 'red' | 'green' | 'purple';
  intensity?: 'low' | 'medium' | 'high';
}

const FuturisticCard = React.forwardRef<HTMLDivElement, FuturisticCardProps>(
  ({ className = '', glowColor = 'gold', intensity = 'medium', children, ...props }, ref) => {
    
    const glowMap = {
      gold: 'hover:shadow-[0_0_30px_-5px_rgba(212,165,116,0.5)] border-amber-500/30',
      blue: 'hover:shadow-[0_0_30px_-5px_rgba(59,130,246,0.5)] border-blue-500/30',
      red: 'hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)] border-red-500/30',
      green: 'hover:shadow-[0_0_30px_-5px_rgba(34,197,94,0.5)] border-green-500/30',
      purple: 'hover:shadow-[0_0_30px_-5px_rgba(168,85,247,0.5)] border-purple-500/30',
    };

    const intensityMap = {
      low: 'bg-white/5 backdrop-blur-sm',
      medium: 'bg-white/10 backdrop-blur-md',
      high: 'bg-white/20 backdrop-blur-xl',
    };

    return (
      <div
        ref={ref}
        className={`relative rounded-xl border border-white/10 transition-all duration-300 ease-out group overflow-hidden ${intensityMap[intensity]} ${glowMap[glowColor]} ${className}`}
        {...props}
      >
        {/* Shine effect on hover */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent z-0" />
        
        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  }
);
FuturisticCard.displayName = "FuturisticCard";

export { FuturisticCard };
