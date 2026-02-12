import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { QCStats, DefectAnalysis } from '../../types';

interface QCChartsSectionProps {
  stats: QCStats;
  defectAnalysis?: DefectAnalysis;
}

const MOCK_APPROVAL_TREND = [
  { date: 'Feb 4', approvalRate: 92, target: 90 },
  { date: 'Feb 5', approvalRate: 88, target: 90 },
  { date: 'Feb 6', approvalRate: 94, target: 90 },
  { date: 'Feb 7', approvalRate: 91, target: 90 },
  { date: 'Feb 8', approvalRate: 93, target: 90 },
  { date: 'Feb 9', approvalRate: 89, target: 90 },
  { date: 'Feb 10', approvalRate: 95, target: 90 },
];

const MOCK_DEFECTS = [
  { type: 'Discoloration', count: 12 },
  { type: 'Cracks', count: 8 },
  { type: 'Air bubbles', count: 15 },
  { type: 'Uneven coating', count: 6 },
  { type: 'Blooming', count: 4 },
];

const MOCK_QUALITY_TREND = [
  { date: 'Feb 4', appearance: 2.8, texture: 2.6, taste: 2.9 },
  { date: 'Feb 5', appearance: 2.6, texture: 2.5, taste: 2.8 },
  { date: 'Feb 6', appearance: 2.9, texture: 2.7, taste: 3.0 },
  { date: 'Feb 7', appearance: 2.7, texture: 2.6, taste: 2.8 },
  { date: 'Feb 8', appearance: 2.9, texture: 2.8, taste: 2.9 },
  { date: 'Feb 9', appearance: 2.5, texture: 2.4, taste: 2.7 },
  { date: 'Feb 10', appearance: 3.0, texture: 2.8, taste: 3.0 },
];

const QCChartsSection: React.FC<QCChartsSectionProps> = ({
  stats,
  defectAnalysis,
}) => {
  // Prepare approval rate trend data (last 7 days)
  const approvalTrendData = useMemo(() => {
    return stats.approvalTrend ?? MOCK_APPROVAL_TREND;
  }, [stats.approvalTrend]);

  // Prepare defects by type data
  const defectsData = useMemo(() => {
    return defectAnalysis?.defectsByType ? defectAnalysis.defectsByType.slice(0, 5) : MOCK_DEFECTS;
  }, [defectAnalysis]);

  // Prepare quality scores over time
  const qualityScoresData = useMemo(() => {
    return (stats.qualityScoresTrend ?? MOCK_QUALITY_TREND).map(d => ({
        ...d,
        appearance: Math.min(d.appearance, 3),
        texture: Math.min(d.texture, 3),
        taste: Math.min(d.taste, 3),
    }));
  }, [stats.qualityScoresTrend]);

  const tooltipStyle = {
    backgroundColor: '#FFFFFF',
    border: '2px solid #CFFAFE',
    borderRadius: '1rem',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    fontSize: '11px',
    fontWeight: '700',
    color: '#083344',
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Approval Velocity */}
      <div className="bg-white rounded-2xl p-8 border-2 border-cyan-50">
            <h3 className="text-xs font-black text-cyan-900 uppercase tracking-widest mb-8 flex items-center gap-3">
              <div className="w-1 h-4 bg-cyan-500 rounded-full" />
              Approval Performance
            </h3>
            <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={approvalTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECFEFF" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#083344"
                      style={{ fontSize: '10px', fontWeight: '800' }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#083344"
                      style={{ fontSize: '10px', fontWeight: '800' }}
                      domain={[0, 100]}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(val) => `${val}%`}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="circle"
                      wrapperStyle={{ paddingBottom: '30px', fontSize: '10px', fontWeight: '800' }} 
                    />
                    <Line
                      type="monotone"
                      dataKey="approvalRate"
                      stroke="#06B6D4"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#06B6D4' }}
                      activeDot={{ r: 6, strokeWidth: 0, fill: '#083344' }}
                      name="Rate %"
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
      </div>
 
      {/* Defects by Type */}
      <div className="bg-white rounded-2xl p-8 border-2 border-cyan-50">
            <h3 className="text-xs font-black text-cyan-900 uppercase tracking-widest mb-8 flex items-center gap-3">
              <div className="w-1 h-4 bg-red-500 rounded-full" />
              Defect Distribution
            </h3>
            <div className="h-[280px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={defectsData} layout="vertical" margin={{ left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F8FAFC" />
                    <XAxis 
                        type="number" 
                        stroke="#083344" 
                        style={{ fontSize: '10px', fontWeight: '800' }}
                        tickLine={false}
                        axisLine={false}
                    />
                    <YAxis 
                        dataKey="type" 
                        type="category" 
                        stroke="#083344" 
                        style={{ fontSize: '10px', fontWeight: '800' }} 
                        width={100}
                        tickLine={false}
                        axisLine={false}
                    />
                    <Tooltip cursor={{ fill: '#F1F5F9' }} contentStyle={tooltipStyle} />
                    <Bar 
                        dataKey="count" 
                        fill="#EF4444" 
                        name="Quantity" 
                        radius={[0, 8, 8, 0]}
                        barSize={12}
                    />
                </BarChart>
                </ResponsiveContainer>
            </div>
      </div>
 
      {/* Quality Scores Over Time */}
      <div className="lg:col-span-2 bg-white rounded-2xl p-8 border-2 border-cyan-50">
            <h3 className="text-xs font-black text-cyan-900 uppercase tracking-widest mb-10 flex items-center gap-3">
              <div className="w-1 h-4 bg-cyan-900 rounded-full" />
              Sensory Performance Analytics (3-Star Scale)
            </h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={qualityScoresData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ECFEFF" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#083344"
                      style={{ fontSize: '10px', fontWeight: '800' }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#083344"
                      style={{ fontSize: '10px', fontWeight: '800' }}
                      domain={[0, 3]}
                      ticks={[0, 1, 2, 3]}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      iconType="rect"
                      wrapperStyle={{ paddingBottom: '40px', fontSize: '10px', fontWeight: '800' }} 
                    />
                    <Line
                      type="monotone"
                      dataKey="appearance"
                      stroke="#0EA5E9"
                      strokeWidth={2}
                      dot={false}
                      name="Visual"
                    />
                    <Line
                      type="monotone"
                      dataKey="texture"
                      stroke="#10B981"
                      strokeWidth={2}
                      dot={false}
                      name="Structural"
                    />
                    <Line
                      type="monotone"
                      dataKey="taste"
                      stroke="#F59E0B"
                      strokeWidth={2}
                      dot={false}
                      name="Flavor"
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
      </div>
    </div>
  );
};

export default QCChartsSection;
