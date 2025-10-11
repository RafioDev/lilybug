import React, { useState, useEffect } from 'react';
import { Wine, Moon, Baby, Droplets, Plus } from 'lucide-react';
import { Layout } from '../components/Layout';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { Input } from '../components/Input';
import { trackerService } from '../services/trackerService';
import type { TrackerEntry, EntryType, FeedingType, DiaperType } from '../types';

export const TrackerPage: React.FC = () => {
  const [entries, setEntries] = useState<TrackerEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<EntryType | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    startTime: new Date().toISOString().slice(0, 16),
    endTime: '',
    quantity: '',
    feedingType: 'bottle' as FeedingType,
    diaperType: 'wet' as DiaperType,
    notes: '',
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const data = await trackerService.getEntries();
      setEntries(data);
    } catch (error) {
      console.error('Error loading entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: EntryType) => {
    setSelectedType(type);
    setFormData({
      startTime: new Date().toISOString().slice(0, 16),
      endTime: '',
      quantity: '',
      feedingType: 'bottle',
      diaperType: 'wet',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedType) return;

    try {
      const entry = {
        entry_type: selectedType,
        start_time: formData.startTime,
        end_time: formData.endTime || null,
        quantity: formData.quantity ? parseFloat(formData.quantity) : null,
        feeding_type: selectedType === 'feeding' ? formData.feedingType : null,
        diaper_type: selectedType === 'diaper' ? formData.diaperType : null,
        notes: formData.notes || null,
      };

      await trackerService.createEntry(entry);
      await loadEntries();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating entry:', error);
    }
  };

  const trackerTypes = [
    { type: 'feeding' as EntryType, label: 'Feeding', icon: Wine, color: 'from-blue-500 to-blue-600' },
    { type: 'sleep' as EntryType, label: 'Sleep', icon: Moon, color: 'from-cyan-500 to-cyan-600' },
    { type: 'diaper' as EntryType, label: 'Diaper', icon: Baby, color: 'from-emerald-500 to-emerald-600' },
    { type: 'pumping' as EntryType, label: 'Pumping', icon: Droplets, color: 'from-pink-500 to-pink-600' },
  ];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getEntryIcon = (type: EntryType) => {
    const item = trackerTypes.find(t => t.type === type);
    return item ? item.icon : Baby;
  };

  const getEntryDetails = (entry: TrackerEntry) => {
    if (entry.entry_type === 'feeding' && entry.quantity) {
      return `${entry.quantity} oz • ${entry.feeding_type}`;
    }
    if (entry.entry_type === 'diaper') {
      return entry.diaper_type;
    }
    if (entry.entry_type === 'sleep' && entry.end_time) {
      const duration = (new Date(entry.end_time).getTime() - new Date(entry.start_time).getTime()) / 1000 / 60;
      return `${Math.round(duration)} min`;
    }
    if (entry.entry_type === 'pumping' && entry.quantity) {
      return `${entry.quantity} oz`;
    }
    return '';
  };

  return (
    <Layout title="Baby Tracker">
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          {trackerTypes.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.type} padding="none" className="overflow-hidden">
                <button
                  onClick={() => openModal(item.type)}
                  className="w-full p-4 flex flex-col items-center gap-2 hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-3 rounded-full bg-gradient-to-r ${item.color}`}>
                    <Icon size={28} className="text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  <Plus size={18} className="text-gray-400" />
                </button>
              </Card>
            );
          })}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 px-1">Recent Activity</h2>
          {loading ? (
            <Card>
              <p className="text-center text-gray-500">Loading entries...</p>
            </Card>
          ) : entries.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500">No entries yet. Tap a button above to start tracking!</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const Icon = getEntryIcon(entry.entry_type);
                return (
                  <Card key={entry.id} padding="sm">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Icon size={20} className="text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-gray-800 capitalize">{entry.entry_type}</p>
                            <p className="text-sm text-gray-500">{getEntryDetails(entry)}</p>
                            {entry.notes && (
                              <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-gray-700">{formatTime(entry.start_time)}</p>
                            <p className="text-xs text-gray-500">{formatDate(entry.start_time)}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Log ${selectedType}`}>
        <div className="space-y-4">
          <Input
            label="Start Time"
            type="datetime-local"
            value={formData.startTime}
            onChange={(val) => setFormData({ ...formData, startTime: val })}
          />

          {(selectedType === 'sleep' || selectedType === 'feeding') && (
            <Input
              label="End Time (optional)"
              type="datetime-local"
              value={formData.endTime}
              onChange={(val) => setFormData({ ...formData, endTime: val })}
            />
          )}

          {selectedType === 'feeding' && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-700 px-1 block mb-2">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['bottle', 'breast_left', 'breast_right', 'both'] as FeedingType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({ ...formData, feedingType: type })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        formData.feedingType === type
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">{type.replace('_', ' ')}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Input
                label="Amount (oz)"
                type="number"
                step="0.5"
                value={formData.quantity}
                onChange={(val) => setFormData({ ...formData, quantity: val })}
                placeholder="e.g., 4"
              />
            </>
          )}

          {selectedType === 'pumping' && (
            <Input
              label="Amount (oz)"
              type="number"
              step="0.5"
              value={formData.quantity}
              onChange={(val) => setFormData({ ...formData, quantity: val })}
              placeholder="e.g., 4"
            />
          )}

          {selectedType === 'diaper' && (
            <div>
              <label className="text-sm font-medium text-gray-700 px-1 block mb-2">Type</label>
              <div className="grid grid-cols-3 gap-2">
                {(['wet', 'dirty', 'both'] as DiaperType[]).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFormData({ ...formData, diaperType: type })}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.diaperType === type
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <span className="text-sm font-medium capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <Input
            label="Notes (optional)"
            type="textarea"
            value={formData.notes}
            onChange={(val) => setFormData({ ...formData, notes: val })}
            placeholder="Any additional details..."
            rows={2}
          />

          <Button onClick={handleSubmit} fullWidth>
            Save Entry
          </Button>
        </div>
      </Modal>
    </Layout>
  );
};
