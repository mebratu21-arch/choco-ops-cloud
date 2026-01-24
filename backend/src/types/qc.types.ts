export interface QualityUpdateInput {
  batch_id: string;
  status: 'APPROVED' | 'REJECTED' | 'QUARANTINE' | 'PENDING';
  defect_count?: number;
  notes?: string;
}
