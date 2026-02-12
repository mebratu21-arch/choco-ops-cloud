import React, { useState } from 'react';
import { Eye, Star, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../ui/Badge';
import QCDetailModal from './QCDetailModal';
import { QCCheck } from '../../types';

interface QCHistoryTableProps {
  qcChecks: QCCheck[];
  loading: boolean;
}

const QCHistoryTable: React.FC<QCHistoryTableProps> = ({
  qcChecks,
  loading,
}) => {
  const navigate = useNavigate();
  const [selectedQCId, setSelectedQCId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMins > 0) return `${diffMins}m ago`;
    return 'Just now';
  };

  const getResultVariant = (result: string) => {
    switch (result) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'quarantine': return 'warning';
      default: return 'default';
    }
  };

  const getResultLabel = (result: string) => {
      switch (result) {
        case 'approved': return 'Approved';
        case 'rejected': return 'Rejected';
        case 'quarantine': return 'Quarantine';
        default: return result;
      }
    };

  const getRowColor = (result: string) => {
    switch (result) {
      case 'approved':
        return 'hover:bg-green-50/50';
      case 'rejected':
        return 'hover:bg-red-50/50';
      case 'quarantine':
        return 'hover:bg-amber-50/50';
      default:
        return 'hover:bg-cyan-50/50';
    }
  };

  const handleViewQC = (qcId: string) => {
    setSelectedQCId(qcId);
    setIsDetailModalOpen(true);
  };

  const ScoreDisplay: React.FC<{ score: number }> = ({ score }) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= score
              ? 'text-cyan-500 fill-cyan-500'
              : 'text-cyan-100'
          }`}
        />
      ))}
      <span className="ml-2 text-[10px] font-black text-cyan-900/40">
        {Math.min(score, 3).toFixed(1)}/3
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="p-10">
        <div className="space-y-4 animate-pulse">
             {Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="h-12 bg-cyan-50/30 rounded-xl w-full border border-cyan-50"></div>
             ))}
        </div>
      </div>
    );
  }

  if (qcChecks.length === 0) {
    return (
      <div className="p-16 text-center">
        <div className="w-16 h-16 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border-2 border-cyan-100">
           <Eye className="w-8 h-8 text-cyan-300" />
        </div>
        <h3 className="text-lg font-black text-cyan-900 uppercase tracking-tight mb-2">
          No Inspection Data
        </h3>
        <p className="text-cyan-600/40 text-[10px] font-bold uppercase tracking-widest">
          The official ledger is currently empty.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-cyan-100 bg-cyan-50/20">
              <th className="px-6 py-4 text-left text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
                Batch Ref
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
                Inspector
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
                Time
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
                Appearance
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
                Texture
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
                Taste
              </th>
              <th className="px-6 py-4 text-left text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
                Status
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
                Defects
              </th>
              <th className="px-6 py-4 text-right text-[10px] font-black text-cyan-800/40 uppercase tracking-widest">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y border-cyan-50 text-black">
            {qcChecks.map((qc) => {
              const resultVariant = getResultVariant(qc.result);
              return (
                <tr
                  key={qc.id}
                  className={`transition-colors h-16 ${getRowColor(qc.result)}`}
                >
                  <td className="px-6 py-4">
                    <button
                      onClick={() => navigate(`/production/batches/${qc.batch_id}`)}
                      className="font-mono text-xs font-bold text-cyan-700 hover:text-cyan-900 flex items-center gap-2"
                    >
                      {qc.batch_number}
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-bold text-cyan-900 uppercase">
                      {qc.inspector_name}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[10px] text-cyan-800/40 font-black uppercase">
                      {formatTimeAgo(qc.inspection_date)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ScoreDisplay score={qc.appearance_score ?? 0} />
                  </td>
                  <td className="px-6 py-4">
                    <ScoreDisplay score={qc.texture_score ?? 0} />
                  </td>
                  <td className="px-6 py-4">
                    <ScoreDisplay score={qc.taste_score ?? 0} />
                  </td>
                  <td className="px-6 py-4">
                    <Badge 
                      variant={resultVariant}
                      className="rounded-lg px-3 py-1 text-[8px] font-black uppercase tracking-widest border-2"
                    >
                      {getResultLabel(qc.result)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`text-[11px] font-black ${
                        qc.defect_count > 0 ? 'text-red-600' : 'text-green-600'
                      }`}
                    >
                      {qc.defect_count}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleViewQC(qc.id)}
                      className="p-2.5 bg-cyan-50 hover:bg-cyan-900 hover:text-white text-cyan-600 rounded-lg border border-cyan-100 transition-all active:scale-95"
                      title="View Analysis"
                    >
                        <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* QC Detail Modal */}
      {selectedQCId && (
        <QCDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedQCId(null);
          }}
          qcCheckId={selectedQCId}
        />
      )}
    </>
  );
};

export default QCHistoryTable;
