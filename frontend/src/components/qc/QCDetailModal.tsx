import React from 'react';
import {
  Star,
  User,
  Calendar,
  ThermometerSun,
  AlertTriangle,
  Package,
  FileText,
} from 'lucide-react';
import { Modal } from '../common/Modal';
import { Badge } from '../ui/Badge';
import { useQC } from '../../hooks/useQC';

interface QCDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  qcCheckId: string;
}

const QCDetailModal: React.FC<QCDetailModalProps> = ({
  isOpen,
  onClose,
  qcCheckId,
}) => {
  const { useQCCheck } = useQC();
  
  const { data: qcData, isLoading, error } = useQCCheck(qcCheckId);

  const qc = qcData;

  const getResultBadge = (result: string) => {
    switch (result) {
      case 'approved':
        return { variant: 'success' as const, label: 'Approved', icon: '✅' };
      case 'rejected':
        return { variant: 'error' as const, label: 'Rejected', icon: '❌' };
      case 'quarantine':
        return { variant: 'warning' as const, label: 'Quarantine', icon: '⚠️' };
      default:
        return { variant: 'default' as const, label: result, icon: '❓' };
    }
  };

  const StarDisplay: React.FC<{ score: number; label: string }> = ({
    score,
    label,
  }) => (
    <div className="bg-chocolate-50 p-4 rounded-lg">
      <p className="text-sm font-medium text-chocolate-700 mb-2">{label}</p>
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-6 h-6 ${
              star <= score
                ? 'text-gold-500 fill-gold-500'
                : 'text-chocolate-200'
            }`}
          />
        ))}
        <span className="ml-2 text-xl font-bold text-chocolate-800">
          {score}/5
        </span>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="QC Inspection Details">
        <div className="space-y-4 animate-pulse p-4">
          <div className="h-6 bg-chocolate-200 rounded w-3/4"></div>
          <div className="h-4 bg-chocolate-200 rounded w-1/2"></div>
          <div className="h-32 bg-chocolate-200 rounded"></div>
          <div className="h-32 bg-chocolate-200 rounded"></div>
        </div>
      </Modal>
    );
  }

  if (error || !qc) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="QC Inspection Details">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Error loading QC details</p>
          <p className="text-sm text-chocolate-600">
            {error?.message ?? 'QC check not found'}
          </p>
        </div>
      </Modal>
    );
  }

  const resultBadge = getResultBadge(qc.result);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`QC Inspection #${qc.id}`} size="lg">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-chocolate-50 border border-chocolate-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-chocolate-600">Inspection ID: #{qc.id}</p>
              <div className="flex items-center gap-2 text-sm text-chocolate-600 mt-1">
                <Calendar className="w-4 h-4" />
                {new Date(qc.inspection_date).toLocaleString()}
              </div>
            </div>
            
             {/* Result Badge - Large and Prominent */}
            <div className="text-center">
              <div className="text-4xl mb-1">{resultBadge.icon}</div>
              <Badge variant={resultBadge.variant} className="text-base px-4 py-1">
                {resultBadge.label}
              </Badge>
            </div>
          </div>
        </div>

        {/* Batch Information */}
        <div className="border border-chocolate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Package className="w-5 h-5 text-chocolate-600" />
            <h3 className="font-semibold text-chocolate-800">
              Batch Information
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-chocolate-600">Batch Number</p>
              <p className="font-semibold text-chocolate-800 font-mono">
                {qc.batch_number}
              </p>
            </div>
            {qc.recipe_name && (
              <div>
                <p className="text-chocolate-600">Recipe</p>
                <p className="font-semibold text-chocolate-800">
                  {qc.recipe_name}
                </p>
              </div>
            )}
            <div>
                 <p className="text-chocolate-600">Inspector</p>
                 <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-gray-400" />
                    <span className="font-semibold text-chocolate-800">{qc.inspector_name}</span>
                 </div>
            </div>
          </div>
        </div>

        {/* Quality Scores */}
        <div className="border border-chocolate-200 rounded-lg p-4">
          <h3 className="font-semibold text-chocolate-800 mb-4">
            Quality Scores
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StarDisplay score={qc.appearance_score ?? 0} label="Appearance" />
            <StarDisplay score={qc.texture_score ?? 0} label="Texture" />
            <StarDisplay score={qc.taste_score ?? 0} label="Taste" />
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <p className="text-sm text-blue-700">
              <span className="font-semibold">Average Score: </span>
              {(((qc.appearance_score ?? 0) + (qc.texture_score ?? 0) + (qc.taste_score ?? 0)) / 3).toFixed(2)}
              /5
            </p>
          </div>
        </div>

        {/* Environmental & Defects Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Environmental Data */}
            {(qc.temperature ?? qc.humidity) && (
            <div className="border border-chocolate-200 rounded-lg p-4 h-full">
                <h3 className="font-semibold text-chocolate-800 mb-4 flex items-center gap-2">
                    <ThermometerSun className="w-5 h-5" /> Environment
                </h3>
                <div className="space-y-4">
                {qc.temperature && (
                    <div className="bg-chocolate-50 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium text-chocolate-700">Temperature</span>
                        <span className="text-lg font-bold text-chocolate-800">{qc.temperature}°C</span>
                    </div>
                )}
                {qc.humidity && (
                    <div className="bg-chocolate-50 p-3 rounded-lg flex justify-between items-center">
                         <span className="text-sm font-medium text-chocolate-700">Humidity</span>
                        <span className="text-lg font-bold text-chocolate-800">{qc.humidity}%</span>
                    </div>
                )}
                </div>
            </div>
            )}

            {/* Defects Section */}
            <div className="border border-chocolate-200 rounded-lg p-4 h-full">
            <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-chocolate-600" />
                <h3 className="font-semibold text-chocolate-800">Defects</h3>
            </div>
            <div className="mb-3">
                <p className="text-sm text-chocolate-600">Total Count</p>
                <p
                className={`text-2xl font-bold ${
                    qc.defect_count > 0 ? 'text-red-600' : 'text-green-600'
                }`}
                >
                {qc.defect_count}
                </p>
            </div>
            {qc.defect_types && qc.defect_types.length > 0 && (
                <div>
                <p className="text-sm text-chocolate-600 mb-2">Defect Types:</p>
                <div className="flex flex-wrap gap-2">
                    {qc.defect_types.map((defect, index: number) => (
                    <Badge key={index} variant="error">
                        {defect.type} ({defect.count})
                    </Badge>
                    ))}
                </div>
                </div>
            )}
            </div>
        </div>

        {/* Notes */}
        {qc.notes && (
          <div className="border border-chocolate-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-chocolate-600" />
              <h3 className="font-semibold text-chocolate-800">Notes</h3>
            </div>
            <p className="text-chocolate-700 whitespace-pre-wrap">{qc.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default QCDetailModal;
