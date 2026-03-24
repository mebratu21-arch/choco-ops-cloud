import React, { useState, useEffect } from 'react';
import { X, Eye } from 'lucide-react';
import { useCreateAnnouncement, useUpdateAnnouncement } from '../../hooks/useAnnouncementMutations';
import { Announcement, UserRole } from '../../types';
import { toast } from 'sonner';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement?: Announcement | null;
  onSuccess: () => void;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  announcement,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal' as Announcement['priority'],
    target_roles: [] as UserRole[],
    expires_at: '',
    is_active: true
  });
  const [showPreview, setShowPreview] = useState(false);

  const { mutate: createAnnouncement, isPending: isCreating } = useCreateAnnouncement();
  const { mutate: updateAnnouncement, isPending: isUpdating } = useUpdateAnnouncement();

  const allRoles: UserRole[] = ['admin', 'manager', 'production_worker', 'warehouse_worker', 'quality_controller', 'mechanic'];

  useEffect(() => {
    if (announcement) {
      setFormData({ // eslint-disable-line
        title: announcement.title || '',
        content: announcement.content || '',
        priority: announcement.priority || 'normal',
        target_roles: announcement.target_roles || [],
        expires_at: announcement.expires_at ? new Date(announcement.expires_at).toISOString().split('T')[0] : '',
        is_active: announcement.is_active ?? true
      });
    } else {
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        target_roles: [],
        expires_at: '',
        is_active: true
      });
    }
  }, [announcement]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Title and content are required');
      return;
    }

    if (formData.target_roles.length === 0) {
      toast.error('Please select at least one target role');
      return;
    }

    const data = {
      ...formData,
      expires_at: formData.expires_at || undefined
    };

    if (announcement) {
      updateAnnouncement({ id: announcement.id, ...data }, {
        onSuccess: () => {
          toast.success('Announcement updated successfully');
          onSuccess();
          onClose();
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : 'Failed to update announcement';
          toast.error(message);
        }
      });
    } else {
      createAnnouncement(data, {
        onSuccess: () => {
          toast.success('Announcement published successfully');
          onSuccess();
          onClose();
        },
        onError: (error: unknown) => {
          const message = error instanceof Error ? error.message : 'Failed to publish announcement';
          toast.error(message);
        }
      });
    }
  };

  const toggleRole = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.includes(role)
        ? prev.target_roles.filter(r => r !== role)
        : [...prev.target_roles, role]
    }));
  };

  const toggleAllRoles = () => {
    setFormData(prev => ({
      ...prev,
      target_roles: prev.target_roles.length === allRoles.length ? [] : [...allRoles]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showPreview ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                  placeholder="Enter announcement title"
                  required
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={6}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
                  placeholder="Enter announcement content"
                  required
                />
              </div>

              {/* Priority */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['normal', 'high', 'urgent'] as const).map((priority) => (
                    <button
                      key={priority}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, priority: priority as Announcement['priority'] }))}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        formData.priority === priority
                          ? priority === 'urgent'
                            ? 'bg-red-500 text-white'
                            : priority === 'high'
                            ? 'bg-amber-500 text-white'
                            : 'bg-gray-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Roles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Target Roles *
                  </label>
                  <button
                    type="button"
                    onClick={toggleAllRoles}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  >
                    {formData.target_roles.length === allRoles.length ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {allRoles.map((role) => (
                    <label
                      key={role}
                      className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-amber-50 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={formData.target_roles.includes(role)}
                        onChange={() => toggleRole(role)}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-amber-500 focus:outline-none"
                />
              </div>

               <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
                <span className="text-sm font-medium text-gray-700">
                  {formData.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <Eye className="w-5 h-5" />
                  Preview
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all font-medium disabled:opacity-50"
                >
                  {isCreating || isUpdating ? 'Saving...' : announcement ? 'Update' : 'Publish'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              {/* Preview */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border-2 border-amber-200">
                <div className="flex items-start gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 flex-1">
                    {formData.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    formData.priority === 'urgent'
                      ? 'bg-red-100 text-red-700'
                      : formData.priority === 'high'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {formData.priority.toUpperCase()}
                  </span>
                </div>
                
                <p className="text-gray-700 whitespace-pre-wrap mb-4">
                  {formData.content}
                </p>

                <div className="flex flex-wrap gap-2">
                  {formData.target_roles.map((role) => (
                    <span
                      key={role}
                      className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium"
                    >
                      {role.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setShowPreview(false)}
                className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Back to Edit
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
