import React, { useState } from 'react';
import {
  FileText,
  Star,
  Pin,
  Shield,
  Trash2,
  Folder,
  Tag,
  HardDrive,
  Download,
  Upload,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import { Note, Category, StorageMetrics, SubscriptionInfo } from '../types';

interface SidebarProps {
  notes: Note[];
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  selectedView: 'all' | 'starred' | 'pinned' | 'vault' | 'trash';
  setSelectedView: (view: 'all' | 'starred' | 'pinned' | 'vault' | 'trash') => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  onAddCategory: (name: string) => void;
  storageMetrics: StorageMetrics;
  subscription: SubscriptionInfo;
  onOpenStorageModal: () => void;
  onExportVault: () => void;
  onImportVault: () => void;
  isVaultUnlocked: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  notes,
  selectedCategory,
  setSelectedCategory,
  selectedTag,
  setSelectedTag,
  selectedView,
  setSelectedView,
  searchQuery,
  setSearchQuery,
  categories,
  onAddCategory,
  storageMetrics,
  subscription,
  onOpenStorageModal,
  onExportVault,
  onImportVault,
  isVaultUnlocked,
}) => {
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  // Counts
  const activeNotes = notes.filter((n) => !n.isDeleted);
  const starredCount = activeNotes.filter((n) => n.isStarred).length;
  const pinnedCount = activeNotes.filter((n) => n.isPinned).length;
  const lockedCount = activeNotes.filter((n) => n.isLocked).length;
  const trashCount = notes.filter((n) => n.isDeleted).length;

  // Extract all unique tags
  const allTags = Array.from(
    new Set(activeNotes.flatMap((n) => n.tags || []).filter(Boolean))
  ).sort();

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onAddCategory(newCategoryName.trim());
    setNewCategoryName('');
    setIsAddingCategory(false);
  };

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-[calc(100vh-57px)] shrink-0 select-none">
      {/* Search Input */}
      <div className="p-3 border-b border-slate-100">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, tags..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5">
        {/* Quick Views */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1">
            Library
          </div>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                setSelectedView('all');
                setSelectedCategory('all');
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                selectedView === 'all' && selectedCategory === 'all' && !selectedTag
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>All Notes</span>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">
                {activeNotes.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedView('pinned');
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                selectedView === 'pinned'
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pin className="w-3.5 h-3.5 text-blue-500" />
                <span>Pinned</span>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">{pinnedCount}</span>
            </button>

            <button
              onClick={() => {
                setSelectedView('starred');
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                selectedView === 'starred'
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Star className="w-3.5 h-3.5 text-amber-500" />
                <span>Starred</span>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">{starredCount}</span>
            </button>

            <button
              onClick={() => {
                setSelectedView('vault');
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                selectedView === 'vault'
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Shield
                  className={`w-3.5 h-3.5 ${isVaultUnlocked ? 'text-emerald-500' : 'text-amber-500'}`}
                />
                <span>Encrypted Vault</span>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">{lockedCount}</span>
            </button>

            <button
              onClick={() => {
                setSelectedView('trash');
                setSelectedTag(null);
              }}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                selectedView === 'trash'
                  ? 'bg-slate-100 text-slate-900 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Trash</span>
              </div>
              <span className="text-[11px] text-slate-400 tabular-nums">{trashCount}</span>
            </button>
          </div>
        </div>

        {/* Notebooks / Categories */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Notebooks
            </span>
            <button
              onClick={() => setIsAddingCategory(true)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-0.5"
              title="Add Notebook"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-0.5">
            {categories
              .filter((c) => c.id !== 'all')
              .map((cat) => {
                const count = activeNotes.filter((n) => n.category === cat.id).length;
                const isSelected = selectedCategory === cat.id && selectedView === 'all';
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setSelectedView('all');
                      setSelectedTag(null);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors ${
                      isSelected
                        ? 'bg-slate-100 text-slate-900 font-medium'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Folder
                        className="w-3.5 h-3.5 shrink-0"
                        style={{ color: cat.color }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 tabular-nums shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}

            {isAddingCategory && (
              <form onSubmit={handleCreateCategory} className="px-1 py-1">
                <input
                  type="text"
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onBlur={() => {
                    if (!newCategoryName.trim()) setIsAddingCategory(false);
                  }}
                  placeholder="Notebook name..."
                  className="w-full px-2 py-1 text-xs border border-slate-300 rounded bg-white text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </form>
            )}
          </div>
        </div>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
              Tags
            </div>
            <div className="flex flex-wrap gap-1 px-1">
              {allTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded transition-colors ${
                      isSelected
                        ? 'bg-slate-900 text-white font-medium'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Tag className="w-2.5 h-2.5 opacity-60" />
                    <span>#{tag}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Cloud Storage 100GB Meter & Tier Card */}
      <div className="p-3 border-t border-slate-200 bg-slate-50">
        <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
              <HardDrive className="w-3.5 h-3.5 text-sky-600" />
              <span>Cloud Storage</span>
            </div>
            <span className="text-[11px] font-medium text-slate-500 tabular-nums">
              {subscription.planId === 'free' ? '5 GB Plan' : '100 GB Plan'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full transition-all duration-300 ${
                storageMetrics.percentage > 90
                  ? 'bg-rose-500'
                  : storageMetrics.percentage > 70
                  ? 'bg-amber-500'
                  : 'bg-sky-500'
              }`}
              style={{ width: `${Math.max(1, storageMetrics.percentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2.5 tabular-nums">
            <span>{storageMetrics.formattedUsed} used</span>
            <span>{storageMetrics.formattedLimit}</span>
          </div>

          {/* Upgrade / Plan Button */}
          <button
            onClick={onOpenStorageModal}
            className="w-full py-1.5 px-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-sky-400" />
            <span>
              {subscription.planId === 'free'
                ? 'Upgrade to 100GB ($1/mo)'
                : 'Manage 100GB Plan ($1)'}
            </span>
          </button>
        </div>

        {/* Encrypted Vault Export/Backup Actions */}
        <div className="flex items-center justify-between pt-2 px-1 text-[11px] text-slate-500">
          <button
            onClick={onExportVault}
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
            title="Download encrypted backup file (.vault)"
          >
            <Download className="w-3 h-3" />
            <span>Backup</span>
          </button>
          <span className="text-slate-300">·</span>
          <button
            onClick={onImportVault}
            className="hover:text-slate-900 transition-colors flex items-center gap-1"
            title="Restore notes from encrypted backup file"
          >
            <Upload className="w-3 h-3" />
            <span>Restore</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
