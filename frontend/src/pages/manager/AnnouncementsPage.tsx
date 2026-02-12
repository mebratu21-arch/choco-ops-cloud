import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Eye,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Users,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  Globe
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip
} from 'recharts';
import { toast } from 'sonner';
import PageHeader from '../../components/layout/PageHeader';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/common/Modal';
import AnnouncementModal from '../../components/manager/AnnouncementModal';
import { useAnnouncements } from '../../hooks/useAnnouncements';
import { useDeleteAnnouncement, useToggleAnnouncement } from '../../hooks/useAnnouncementMutations';
import { Announcement, AnnouncementPriority, UserRole } from '../../types';
import { cn } from '../../lib/utils';

// Priority badge colors
const priorityConfig: Record<AnnouncementPriority, { label: string; variant: 'error' | 'warning' | 'default' }> = {
  urgent: { label: 'Urgent', variant: 'error' },
  high: { label: 'High', variant: 'warning' },
  normal: { label: 'Normal', variant: 'default' },
};

// Role labels
const roleLabels: Record<UserRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  production_worker: 'Production',
  warehouse_worker: 'Warehouse',
  quality_controller: 'QC',
  mechanic: 'Mechanic',
};

// --- Sample Data ---
const SAMPLE_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-001',
    title: 'Q1 Production Efficiency Targets',
    content: 'All teams should aim for a 5% increase in tempering efficiency following the latest machine calibrations.',
    priority: 'high',
    target_roles: ['admin', 'manager', 'production_worker'],
    is_active: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    expires_at: new Date(Date.now() + 604800000).toISOString(),
    created_by: 'usr-001',
    created_by_name: 'Master Chocolatier',
  },
  {
    id: 'ann-002',
    title: 'Urgent: Raw Material Inspection',
    content: 'Quality check required for cocoa butter batch #CB-9042 arriving today.',
    priority: 'urgent',
    target_roles: ['quality_controller', 'warehouse_worker'],
    is_active: true,
    created_at: new Date(Date.now() - 3600000).toISOString(),
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    created_by: 'usr-002',
    created_by_name: 'Lead QC',
  },
  {
    id: 'ann-003',
    title: 'Inventory Audit - Weekend Shift',
    content: 'Annual inventory audit will take place this Saturday. Please ensure all stock lists are updated.',
    priority: 'normal',
    target_roles: ['admin', 'manager', 'warehouse_worker'],
    is_active: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    created_by: 'usr-003',
    created_by_name: 'Systems Admin',
  },
  {
    id: 'ann-004',
    title: 'New Safety Protocols for Grinding Mill',
    content: 'Please review the updated safety documentation before operating the grinding units.',
    priority: 'high',
    target_roles: ['production_worker', 'mechanic'],
    is_active: true,
    created_at: new Date(Date.now() - 432000000).toISOString(),
    created_by: 'usr-004',
    created_by_name: 'Safety Officer',
  }
];

const PRIORITY_COLORS = {
  urgent: '#ef4444', // Red-500
  high: '#f59e0b',   // Amber-500
  normal: '#78350f', // Brown-900 (Cocoa)
};

const AnnouncementsPage: React.FC = () => {
  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<AnnouncementPriority | 'all'>('all');
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewAnnouncement, setPreviewAnnouncement] = useState<Announcement | null>(null);

  // Hooks
  const { announcements: realAnnouncements = [], loading, refetch } = useAnnouncements();
  
  // Combine real data with sample data if real data is empty
  const announcements = useMemo(() => {
    return realAnnouncements.length > 0 ? realAnnouncements : SAMPLE_ANNOUNCEMENTS;
  }, [realAnnouncements]);

  const deleteAnnouncementMutation = useDeleteAnnouncement();
  const toggleAnnouncementMutation = useToggleAnnouncement();

  // Filter and search announcements
  const filteredAnnouncements = useMemo(() => {
    return announcements.filter((announcement: Announcement) => {
      // Search filter
      const matchesSearch =
        searchQuery === '' ||
        announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        announcement.content.toLowerCase().includes(searchQuery.toLowerCase());

      // Priority filter
      const matchesPriority =
        priorityFilter === 'all' || announcement.priority === priorityFilter;

      // Active filter
      const matchesActive =
        activeFilter === 'all' ||
        (activeFilter === 'active' && announcement.is_active) ||
        (activeFilter === 'inactive' && !announcement.is_active);

      return matchesSearch && matchesPriority && matchesActive;
    });
  }, [announcements, searchQuery, priorityFilter, activeFilter]);

  // Handlers
  const handleCreateNew = () => {
    setSelectedAnnouncement(null);
    setIsModalOpen(true);
  };

  const handleEdit = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setIsModalOpen(true);
  };

  const handleDelete = (announcement: Announcement) => {
    setAnnouncementToDelete(announcement);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!announcementToDelete) return;

    try {
      await deleteAnnouncementMutation.mutateAsync(announcementToDelete.id);
      toast.success('Announcement deleted successfully');
      setIsDeleteModalOpen(false);
      setAnnouncementToDelete(null);
      void refetch();
    } catch {
      toast.error('Failed to delete announcement');
    }
  };

  const handleToggleActive = async (announcement: Announcement) => {
    try {
      await toggleAnnouncementMutation.mutateAsync({
        id: announcement.id,
        isActive: !announcement.is_active,
      });
      toast.success(
        announcement.is_active
          ? 'Announcement deactivated'
          : 'Announcement activated'
      );
      void refetch();
    } catch {
      toast.error('Failed to update announcement');
    }
  };

  const handlePreview = (announcement: Announcement) => {
    setPreviewAnnouncement(announcement);
    setIsPreviewOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAnnouncement(null);
    void refetch();
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Check if announcement is expired
  const isExpired = (announcement: Announcement) => {
    if (!announcement.expires_at) return false;
    return new Date(announcement.expires_at) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <PageHeader
          title="Announcements"
          subtitle="Create and manage announcements for your team"
          icon={Megaphone}
        />
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Announcement
        </Button>
      </div>

      {/* Analytics Dashboard Layer */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-chocolate-900 to-amber-950 text-white border-none shadow-xl overflow-hidden relative group">
             <div className="absolute top-0 right-0 p-3 opacity-20 transform group-hover:scale-125 transition-transform duration-500">
               <Megaphone className="w-16 h-16" />
             </div>
             <CardContent className="p-6 relative z-10">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 text-amber-200">Total System Broadcasts</p>
               <h4 className="text-4xl font-black">{announcements.length}</h4>
               <div className="flex items-center gap-2 mt-4 text-xs font-bold text-amber-100/70">
                 <span className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-full border border-white/5">
                   <TrendingUp className="w-3 h-3 text-emerald-400" /> +2 this week
                 </span>
               </div>
             </CardContent>
          </Card>

          <Card className="bg-white border-chocolate-100 shadow-sm hover:shadow-md transition-shadow">
             <CardContent className="p-6">
               <div className="flex items-center gap-3 mb-2 text-chocolate-900">
                 <div className="p-2 bg-emerald-100 rounded-lg">
                   <Globe className="w-4 h-4 text-emerald-600" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">Active Reach</p>
               </div>
               <h4 className="text-3xl font-black text-chocolate-950">{announcements.filter(a => a.is_active).length}</h4>
               <p className="text-[10px] font-bold text-chocolate-400 mt-2">CURRENTLY VISIBLE TO TEAM</p>
             </CardContent>
          </Card>

          <Card className="bg-white border-chocolate-100 shadow-sm hover:shadow-md transition-shadow">
             <CardContent className="p-6">
               <div className="flex items-center gap-3 mb-2 text-chocolate-900">
                 <div className="p-2 bg-red-100 rounded-lg">
                   <AlertTriangle className="w-4 h-4 text-red-600" />
                 </div>
                 <p className="text-[10px] font-black uppercase tracking-[0.2em]">Urgent Alerts</p>
               </div>
               <h4 className="text-3xl font-black text-chocolate-950">{announcements.filter(a => a.priority === 'urgent').length}</h4>
               <p className="text-[10px] font-bold text-chocolate-400 mt-2">REQUIRES IMMEDIATE ATTENTION</p>
             </CardContent>
          </Card>
        </div>

        {/* Priority Chart */}
        <Card className="bg-white border-chocolate-100 shadow-sm">
           <CardContent className="p-4 flex flex-col items-center justify-center h-full">
             <div className="flex items-center gap-2 mb-4 w-full">
                <BarChart3 className="w-4 h-4 text-chocolate-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-chocolate-500">Priority Map</span>
             </div>
             <div className="h-[120px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                    <Pie
                      data={[
                        { name: 'Urgent', value: announcements.filter(a => a.priority === 'urgent').length, color: PRIORITY_COLORS.urgent },
                        { name: 'High', value: announcements.filter(a => a.priority === 'high').length, color: PRIORITY_COLORS.high },
                        { name: 'Normal', value: announcements.filter(a => a.priority === 'normal').length, color: PRIORITY_COLORS.normal },
                      ].filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Urgent', color: PRIORITY_COLORS.urgent },
                        { name: 'High', color: PRIORITY_COLORS.high },
                        { name: 'Normal', color: PRIORITY_COLORS.normal },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px', fontWeight: 700 }}
                    />
                 </PieChart>
               </ResponsiveContainer>
             </div>
           </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search announcements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Priority Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as AnnouncementPriority | 'all')}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cocoa-500"
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
              </select>
            </div>

            {/* Active Filter */}
            <div className="flex items-center gap-2">
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cocoa-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="py-6">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-slate-200 rounded w-1/3" />
                    <div className="h-4 bg-slate-100 rounded w-2/3" />
                    <div className="h-3 bg-slate-100 rounded w-1/4" />
                  </div>
                  <div className="w-24 h-8 bg-slate-200 rounded" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredAnnouncements.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Megaphone className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-700 mb-2">
                  No announcements found
                </h3>
                <p className="text-slate-500 mb-4">
                  {searchQuery || priorityFilter !== 'all' || activeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first announcement to get started'}
                </p>
                <Button onClick={handleCreateNew} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Announcement
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Announcements list
          filteredAnnouncements.map((announcement: Announcement) => (
            <Card
              key={announcement.id}
              className={cn(
                "transition-all hover:shadow-md",
                !announcement.is_active && "opacity-60",
                isExpired(announcement) && "border-red-200 bg-red-50/30"
              )}
            >
              <CardContent className="py-4">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="font-semibold text-cocoa-900 text-lg">
                        {announcement.title}
                      </h3>
                      <Badge variant={priorityConfig[announcement.priority].variant}>
                        {priorityConfig[announcement.priority].label}
                      </Badge>
                      {!announcement.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {isExpired(announcement) && (
                        <Badge variant="error">Expired</Badge>
                      )}
                    </div>

                    <p className="text-slate-600 text-sm mb-3 line-clamp-2">
                      {announcement.content}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                      {/* Target roles */}
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span>
                          {announcement.target_roles?.length === 6
                            ? 'All Roles'
                            : announcement.target_roles?.map((r) => roleLabels[r]).join(', ')}
                        </span>
                      </div>

                      {/* Created date */}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Created {formatDate(announcement.created_at)}</span>
                      </div>

                      {/* Expires date */}
                      {announcement.expires_at && (
                        <div className={cn(
                          "flex items-center gap-1",
                          isExpired(announcement) && "text-red-500"
                        )}>
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>
                            {isExpired(announcement) ? 'Expired' : 'Expires'}{' '}
                            {formatDate(announcement.expires_at)}
                          </span>
                        </div>
                      )}

                      {/* Created by */}
                      {announcement.created_by_name && (
                        <span>By {announcement.created_by_name}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePreview(announcement)}
                      title="Preview"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { void handleToggleActive(announcement); }}
                      title={announcement.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {announcement.is_active ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(announcement)}
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(announcement)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Stats summary */}
      {!loading && announcements.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-500 px-1">
          <span>
            Showing {filteredAnnouncements.length} of {announcements.length} announcements
          </span>
          <span>
            {announcements.filter((a: Announcement) => a.is_active).length} active
          </span>
        </div>
      )}

      {/* Create/Edit Modal */}
      <AnnouncementModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        announcement={selectedAnnouncement}
        onSuccess={handleModalClose}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Announcement"
      >
        <div className="p-4">
          <p className="text-slate-600 mb-4">
            Are you sure you want to delete "{announcementToDelete?.title}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => { void confirmDelete(); }}
              disabled={deleteAnnouncementMutation.isPending}
            >
              {deleteAnnouncementMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Announcement Preview"
      >
        {previewAnnouncement && (
          <div className="p-4">
            <div className={cn(
              "p-4 rounded-lg border-l-4",
              previewAnnouncement.priority === 'urgent'
                ? 'border-red-500 bg-red-50'
                : previewAnnouncement.priority === 'high'
                ? 'border-amber-500 bg-amber-50'
                : 'border-cocoa-500 bg-cocoa-50'
            )}>
              <div className="flex items-start gap-3 mb-3">
                <Megaphone className={cn(
                  "w-6 h-6 flex-shrink-0",
                  previewAnnouncement.priority === 'urgent'
                    ? 'text-red-600'
                    : previewAnnouncement.priority === 'high'
                    ? 'text-amber-600'
                    : 'text-cocoa-600'
                )} />
                <div>
                  <h3 className="font-semibold text-lg text-cocoa-900">
                    {previewAnnouncement.title}
                  </h3>
                  <Badge
                    variant={priorityConfig[previewAnnouncement.priority].variant}
                    className="mt-1"
                  >
                    {priorityConfig[previewAnnouncement.priority].label}
                  </Badge>
                </div>
              </div>
              <div className="prose prose-sm max-w-none text-slate-700">
                {previewAnnouncement.content.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
                <p>
                  Visible to: {previewAnnouncement.target_roles?.length === 6
                    ? 'All Roles'
                    : previewAnnouncement.target_roles?.map((r) => roleLabels[r]).join(', ')}
                </p>
                <p className="mt-1">
                  Posted by {previewAnnouncement.created_by_name ?? 'Unknown'} on{' '}
                  {formatDate(previewAnnouncement.created_at)}
                </p>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => setIsPreviewOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AnnouncementsPage;
