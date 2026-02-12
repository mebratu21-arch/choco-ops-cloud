import React from 'react';
import { Activity, AlertCircle, Star, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { QCStats } from '../../types';

interface QCStatsCardsProps {
  stats: QCStats;
}

interface StatCard {
  label: string;
  value: string | number;
  icon: typeof Activity;
  color: string;
  suffix: string;
  score?: number;
  isText?: boolean;
}

const QCStatsCards: React.FC<QCStatsCardsProps> = ({ stats }) => {

  const statCards: StatCard[] = [
    {
      label: 'Batch Approval Rate',
      value: stats.passRate ?? 0,
      icon: CheckCircle,
      color: 'cyan',
      suffix: '%',
    },
    {
      label: 'Audit Volume',
      value: stats.totalInspections ?? 0,
      icon: Activity,
      color: 'cyan',
      suffix: ' Units',
    },
    {
      label: 'Performance Score',
      value: stats.averageScore ?? 0,
      icon: Star,
      color: 'cyan',
      suffix: '/3',
      score: stats.averageScore ?? 0,
    },
    {
      label: 'Alert Frequency',
      value: 'Nominal',
      icon: AlertCircle,
      color: 'cyan',
      suffix: '',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <Card
            key={index}
            className="rounded-2xl border-2 border-cyan-100 bg-white shadow-sm hover:shadow-md transition-all duration-300"
          >
           <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-800/40">
                  {stat.label}
                </p>
                <div className="flex items-baseline gap-2">
                  <h4 className="text-3xl font-black text-black tracking-tight">
                    {typeof stat.value === 'number' && !stat.isText ? stat.value.toFixed(stat.suffix.includes('/') ? 1 : 0) : stat.value}
                  </h4>
                  {!stat.isText && (
                    <span className="text-[10px] font-black text-cyan-800/30 uppercase tracking-widest">{stat.suffix}</span>
                  )}
                </div>
              </div>
 
              <div className="p-4 rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
                <Icon className="w-6 h-6" />
              </div>
            </div>
           </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default QCStatsCards;
