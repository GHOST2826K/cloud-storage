import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Note, SubscriptionInfo, VaultSecurityConfig, Category, NoteRevision } from './types';
import {
  loadNotesFromStorage,
  saveNotesToStorage,
  loadSubscriptionFromStorage,
  saveSubscriptionToStorage,
  loadSecurityConfigFromStorage,
  saveSecurityConfigToStorage,
  calculateStorageMetrics,
  DEFAULT_CATEGORIES,
  INITIAL_NOTES,
} from './utils/storage';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { NoteEditor } from './components/NoteEditor';
import { StoragePlanModal } from './components/StoragePlanModal';
import { VaultSecurityModal } from './components/VaultSecurityModal';
import { VersionHistoryModal } from './components/VersionHistoryModal';
import { NotebooksView } from './components/NotebooksView';
import { VaultView } from './components/VaultView';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

export default function App() {
  // Core states
  const [notes, setNotes] = useState<Note[]>(() => loadNotesFromStorage());
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(() => {
    const initialNotes = loadNotesFromStorage();
    return initialNotes.length > 0 ? initialNotes[0].id : null;
  });
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES);
  const [subscription, setSubscription] = useState<SubscriptionInfo>(() =>
    loadSubscriptionFromStorage()
  );
  const [securityConfig, setSecurityConfig] = useState<VaultSecurityConfig>(() =>
    loadSecurityConfigFromStorage()
  );

  // Navigation & Filtering
  const [currentTab, setCurrentTab] = useState<'notes' | 'notebooks' | 'vault' | 'storage' | 'trash'>('notes');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<'all' | 'starred' | 'pinned' | 'vault' | 'trash'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isStorageModalOpen, setIsStorageModalOpen] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedText, setLastSyncedText] = useState('Synced to 100GB Cloud');

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hidden file input for restoring vault backup
  const importFileInputRef = useRef<HTMLInputElement>(null);

  // Add toast helper
  const addToast = (type: 'success' | 'info' | 'warning', title: string, message?: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auto-save notes and simulate cloud sync
  useEffect(() => {
    saveNotesToStorage(notes);
    setIsSyncing(true);
    const timer = setTimeout(() => {
      setIsSyncing(false);
      setLastSyncedText('Synced to Cloud');
    }, 400);
    return () => clearTimeout(timer);
  }, [notes]);

  // Save subscription changes
  useEffect(() => {
    saveSubscriptionToStorage(subscription);
  }, [subscription]);

  // Save security config changes
  useEffect(() => {
    saveSecurityConfigToStorage(securityConfig);
  }, [securityConfig]);

  // Auto-lock timer effect
  useEffect(() => {
    if (!securityConfig.isUnlocked || securityConfig.autoLockMinutes <= 0) return;

    const timeoutMs = securityConfig.autoLockMinutes * 60 * 1000;
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - securityConfig.lastUnlockedTime > timeoutMs) {
        setSecurityConfig((prev) => ({ ...prev, isUnlocked: false }));
        addToast('warning', 'Vault Auto-Locked', 'Secured due to inactivity.');
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [securityConfig]);

  // Compute live storage metrics against current tier limit
  const storageMetrics = useMemo(() => {
    return calculateStorageMetrics(notes, subscription.storageLimitBytes);
  }, [notes, subscription]);

  // Selected note object
  const activeNote = useMemo(() => {
    return notes.find((n) => n.id === selectedNoteId) || null;
  }, [notes, selectedNoteId]);

  // Filter notes based on current view/category/tag/search
  const filteredNotes = useMemo(() => {
    let list = notes;

    // View filter
    if (selectedView === 'trash') {
      return list.filter((n) => n.isDeleted);
    }

    // Otherwise exclude deleted notes
    list = list.filter((n) => !n.isDeleted);

    if (selectedView === 'starred') {
      list = list.filter((n) => n.isStarred);
    } else if (selectedView === 'pinned') {
      list = list.filter((n) => n.isPinned);
    } else if (selectedView === 'vault') {
      list = list.filter((n) => n.isLocked);
    }

    // Category filter
    if (selectedCategory !== 'all') {
      list = list.filter((n) => n.category === selectedCategory);
    }

    // Tag filter
    if (selectedTag) {
      list = list.filter((n) => n.tags && n.tags.includes(selectedTag));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          (n.tags && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [notes, selectedView, selectedCategory, selectedTag, searchQuery]);

  // Handlers
  const handleCreateNewNote = () => {
    const newNoteId = `note-${Date.now()}`;
    const newNote: Note = {
      id: newNoteId,
      title: 'Untitled Note',
      content: '',
      category: selectedCategory !== 'all' ? selectedCategory : 'personal',
      tags: [],
      isPinned: false,
      isStarred: false,
      isLocked: selectedView === 'vault',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isDeleted: false,
      attachments: [],
      revisions: [],
    };

    setNotes((prev) => [newNote, ...prev]);
    setSelectedNoteId(newNoteId);
    setCurrentTab('notes');
    if (selectedView === 'trash') {
      setSelectedView('all');
    }
    addToast('success', 'New Note Created', 'Ready for capture.');
  };

  const handleUpdateNote = (updatedNote: Note) => {
    setNotes((prev) => {
      return prev.map((n) => {
        if (n.id !== updatedNote.id) return n;

        // Auto snapshot revision if content has grown significantly
        const shouldSnapshot =
          Math.abs(n.content.length - updatedNote.content.length) > 100 &&
          n.content.length > 50;

        let revisions = updatedNote.revisions;
        if (shouldSnapshot) {
          const newRev: NoteRevision = {
            id: `rev-${Date.now()}`,
            timestamp: Date.now(),
            title: n.title,
            content: n.content,
            size: n.content.length,
          };
          revisions = [newRev, ...revisions.slice(0, 19)]; // keep 20 revisions
        }

        return {
          ...updatedNote,
          revisions,
        };
      });
    });
  };

  const handleTogglePin = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isPinned: !n.isPinned } : n))
    );
  };

  const handleToggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isStarred: !n.isStarred } : n))
    );
  };

  const handleDeleteNote = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, isDeleted: true, deletedAt: Date.now() } : n
      )
    );
    addToast('info', 'Note Moved to Trash', 'You can restore it anytime.');
  };

  const handleRestoreNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isDeleted: false, deletedAt: undefined } : n))
    );
    addToast('success', 'Note Restored', 'Moved back to notebook.');
  };

  const handlePermanentDeleteNote = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
    }
    addToast('info', 'Permanently Deleted');
  };

  const handleAddCategory = (name: string) => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      iconName: 'Folder',
      color: '#3B82F6',
    };
    setCategories((prev) => [...prev, newCat]);
    addToast('success', 'Notebook Created', `"${name}" added.`);
  };

  // Toggle master vault lock
  const handleToggleVaultLock = () => {
    if (securityConfig.isUnlocked) {
      setSecurityConfig((prev) => ({ ...prev, isUnlocked: false }));
      addToast('info', 'Vault Locked', 'Zero-knowledge AES-256 seal active.');
    } else {
      setIsSecurityModalOpen(true);
    }
  };

  // Manual snapshot for active note
  const handleCreateSnapshot = () => {
    if (!activeNote) return;
    const newRev: NoteRevision = {
      id: `rev-${Date.now()}`,
      timestamp: Date.now(),
      title: activeNote.title,
      content: activeNote.content,
      size: activeNote.content.length,
    };
    const updated = {
      ...activeNote,
      revisions: [newRev, ...activeNote.revisions],
    };
    handleUpdateNote(updated);
    addToast('success', 'Snapshot Saved', 'Version recorded in history.');
  };

  // Restore snapshot version
  const handleRestoreRevision = (revision: NoteRevision) => {
    if (!activeNote) return;
    const updated = {
      ...activeNote,
      title: revision.title,
      content: revision.content,
      updatedAt: Date.now(),
    };
    handleUpdateNote(updated);
    addToast('success', 'Version Restored', 'Replaced with snapshot content.');
  };

  // Export full encrypted vault backup file
  const handleExportVault = () => {
    const backupData = {
      vaultVersion: '1.0',
      exportedAt: new Date().toISOString(),
      subscriptionPlan: subscription.planId,
      totalNotes: notes.length,
      notes,
    };
    const jsonStr = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cloudvault_100gb_backup_${new Date().toISOString().slice(0, 10)}.vault`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    addToast('success', 'Vault Exported', 'Downloaded encrypted .vault archive.');
  };

  // Trigger import file dialog
  const handleImportVault = () => {
    importFileInputRef.current?.click();
  };

  // Handle uploaded .vault JSON
  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (parsed && Array.isArray(parsed.notes)) {
          setNotes(parsed.notes);
          if (parsed.notes.length > 0) {
            setSelectedNoteId(parsed.notes[0].id);
          }
          addToast(
            'success',
            'Vault Restored Successfully',
            `Loaded ${parsed.notes.length} notes from backup.`
          );
        } else {
          addToast('warning', 'Invalid Backup File', 'File structure is unrecognized.');
        }
      } catch (err) {
        addToast('warning', 'Import Failed', 'Could not parse .vault file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC]">
      {/* Hidden file input for backup restore */}
      <input
        type="file"
        ref={importFileInputRef}
        onChange={handleImportFileChange}
        accept=".vault,.json"
        className="hidden"
      />

      {/* Top Bar with Contract: Brand, Nav links, and Primary Action */}
      <TopBar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          if (tab === 'storage') {
            setIsStorageModalOpen(true);
          }
        }}
        onNewNote={handleCreateNewNote}
        onOpenStorageModal={() => setIsStorageModalOpen(true)}
        onToggleVaultLock={handleToggleVaultLock}
        securityConfig={securityConfig}
        subscription={subscription}
        isSyncing={isSyncing}
        lastSyncedText={lastSyncedText}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          notes={notes}
          selectedCategory={selectedCategory}
          setSelectedCategory={(catId) => {
            setSelectedCategory(catId);
            setCurrentTab('notes');
          }}
          selectedTag={selectedTag}
          setSelectedTag={(tag) => {
            setSelectedTag(tag);
            setCurrentTab('notes');
          }}
          selectedView={selectedView}
          setSelectedView={(view) => {
            setSelectedView(view);
            setCurrentTab('notes');
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categories={categories}
          onAddCategory={handleAddCategory}
          storageMetrics={storageMetrics}
          subscription={subscription}
          onOpenStorageModal={() => setIsStorageModalOpen(true)}
          onExportVault={handleExportVault}
          onImportVault={handleImportVault}
          isVaultUnlocked={securityConfig.isUnlocked}
        />

        {/* Dynamic Main Views */}
        {currentTab === 'notebooks' ? (
          <NotebooksView
            categories={categories}
            notes={notes}
            onSelectCategory={(catId) => {
              setSelectedCategory(catId);
              setSelectedView('all');
              setCurrentTab('notes');
            }}
            onAddCategory={handleAddCategory}
          />
        ) : currentTab === 'vault' ? (
          <VaultView
            notes={notes}
            securityConfig={securityConfig}
            onToggleVaultLock={handleToggleVaultLock}
            onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
            onSelectNote={(id) => {
              setSelectedNoteId(id);
              setCurrentTab('notes');
            }}
          />
        ) : (
          <>
            {/* Middle Note List */}
            <NoteList
              notes={filteredNotes}
              selectedNoteId={selectedNoteId}
              onSelectNote={setSelectedNoteId}
              onNewNote={handleCreateNewNote}
              onTogglePin={handleTogglePin}
              onToggleStar={handleToggleStar}
              onDeleteNote={handleDeleteNote}
              onRestoreNote={handleRestoreNote}
              onPermanentDeleteNote={handlePermanentDeleteNote}
              isTrashView={selectedView === 'trash'}
              searchQuery={searchQuery}
              onClearSearch={() => setSearchQuery('')}
              selectedCategory={selectedCategory}
              selectedTag={selectedTag}
              isVaultUnlocked={securityConfig.isUnlocked}
            />

            {/* Right Note Editor */}
            <NoteEditor
              note={activeNote}
              onUpdateNote={handleUpdateNote}
              categories={categories}
              isVaultUnlocked={securityConfig.isUnlocked}
              onUnlockVaultRequest={() => setIsSecurityModalOpen(true)}
              onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
              onDeleteNote={(id) => handleDeleteNote(id)}
            />
          </>
        )}
      </main>

      {/* Storage & 100GB Plan Modal */}
      <StoragePlanModal
        isOpen={isStorageModalOpen}
        onClose={() => setIsStorageModalOpen(false)}
        subscription={subscription}
        storageMetrics={storageMetrics}
        onUpdateSubscription={(newSub) => {
          setSubscription(newSub);
          addToast(
            'success',
            'Plan Updated',
            `Now on ${newSub.name} with ${newSub.storageLimitGB} GB storage.`
          );
        }}
      />

      {/* Master Vault Security Modal */}
      <VaultSecurityModal
        isOpen={isSecurityModalOpen}
        onClose={() => setIsSecurityModalOpen(false)}
        securityConfig={securityConfig}
        onUpdateSecurityConfig={(newConfig) => {
          setSecurityConfig(newConfig);
          addToast('success', 'Security Updated', 'Vault settings saved.');
        }}
        onExportVault={handleExportVault}
        onImportVault={handleImportVault}
        notes={notes}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        note={activeNote}
        onRestoreRevision={handleRestoreRevision}
        onCreateSnapshot={handleCreateSnapshot}
      />

      {/* Action Notification Toasts */}
      <NotificationToast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
