import React, { useState } from 'react';
import {
  Pin,
  Star,
  Trash2,
  Paperclip,
  Lock,
  ArrowUpDown,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { Note, NoteSortOption } from '../types';
import { formatBytes, getUtf8ByteSize } from '../utils/storage';

interface NoteListProps {
  notes: Note[];
  selectedNoteId: string | null;
  onSelectNote: (id: string) => void;
  onNewNote: () => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onToggleStar: (id: string, e: React.MouseEvent) => void;
  onDeleteNote: (id: string, e: React.MouseEvent) => void;
  onRestoreNote: (id: string, e: React.MouseEvent) => void;
  onPermanentDeleteNote: (id: string, e: React.MouseEvent) => void;
  isTrashView: boolean;
  searchQuery: string;
  onClearSearch: () => void;
  selectedCategory: string;
  selectedTag: string | null;
  isVaultUnlocked: boolean;
}

export const NoteList: React.FC<NoteListProps> = ({
  notes,
  selectedNoteId,
  onSelectNote,
  onNewNote,
  onTogglePin,
  onToggleStar,
  onDeleteNote,
  onRestoreNote,
  onPermanentDeleteNote,
  isTrashView,
  searchQuery,
  onClearSearch,
  selectedCategory,
  selectedTag,
  isVaultUnlocked,
}) => {
  const [sortOption, setSortOption] = useState<NoteSortOption>('updated-desc');

  // Format date helper
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    const isThisYear = date.getFullYear() === now.getFullYear();
    if (isThisYear) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Sort notes
  const sortedNotes = [...notes].sort((a, b) => {
    // Pinned notes always stay on top unless in trash
    if (!isTrashView) {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }

    switch (sortOption) {
      case 'updated-desc':
        return b.updatedAt - a.updatedAt;
      case 'updated-asc':
        return a.updatedAt - b.updatedAt;
      case 'created-desc':
        return b.createdAt - a.createdAt;
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'size-desc': {
        const sizeA = getUtf8ByteSize(a.content) + a.attachments.reduce((acc, at) => acc + at.size, 0);
        const sizeB = getUtf8ByteSize(b.content) + b.attachments.reduce((acc, at) => acc + at.size, 0);
        return sizeB - sizeA;
      }
      default:
        return b.updatedAt - a.updatedAt;
    }
  });

  return (
    <div className="w-80 border-r border-slate-200 bg-white flex flex-col h-[calc(100vh-57px)] shrink-0 select-none">
      {/* Header with Sort and Count */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <div className="text-xs text-slate-500 font-medium">
          <span className="text-slate-900 font-semibold tabular-nums">{sortedNotes.length}</span>{' '}
          {sortedNotes.length === 1 ? 'note' : 'notes'}
          {searchQuery && (
            <span className="ml-1 text-slate-400">
              matching &quot;{searchQuery}&quot;
            </span>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3 h-3 text-slate-400" />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as NoteSortOption)}
            className="text-[11px] font-medium text-slate-600 bg-transparent border-none cursor-pointer focus:outline-none hover:text-slate-900"
          >
            <option value="updated-desc">Recently Updated</option>
            <option value="created-desc">Date Created</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="size-desc">Largest Size</option>
          </select>
        </div>
      </div>

      {/* Note Cards List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {sortedNotes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-slate-700 mb-1">
              {isTrashView ? 'Trash is empty' : 'No notes found'}
            </p>
            <p className="text-xs text-slate-500 mb-4">
              {searchQuery
                ? 'Try a different search keyword or clear filters.'
                : isTrashView
                ? 'Deleted notes will appear here.'
                : 'Start capturing your thoughts, documents, and research.'}
            </p>
            {searchQuery ? (
              <button
                onClick={onClearSearch}
                className="px-3 py-1.5 text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors font-medium"
              >
                Clear Search
              </button>
            ) : !isTrashView ? (
              <button
                onClick={onNewNote}
                className="px-3 py-1.5 text-xs text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors font-medium inline-flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" />
                <span>Create First Note</span>
              </button>
            ) : null}
          </div>
        ) : (
          sortedNotes.map((note) => {
            const isSelected = selectedNoteId === note.id;
            const noteBytes =
              getUtf8ByteSize(note.title) +
              getUtf8ByteSize(note.content) +
              note.attachments.reduce((acc, at) => acc + at.size, 0);

            // Clean preview snippet without markdown hashes
            const previewText = note.isLocked && !isVaultUnlocked
              ? '•••• Encrypted with zero-knowledge AES-256-GCM. Unlock vault to read.'
              : note.content
                  .replace(/#+\s+/g, '')
                  .replace(/[*_`~[\]]/g, '')
                  .trim()
                  .slice(0, 100) || 'Empty note...';

            return (
              <div
                key={note.id}
                onClick={() => onSelectNote(note.id)}
                className={`group p-3.5 cursor-pointer transition-all border-l-2 relative ${
                  isSelected
                    ? 'bg-slate-50 border-slate-900'
                    : 'border-transparent hover:bg-slate-50/70'
                }`}
              >
                {/* Header row: Title + Actions */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {note.isPinned && (
                      <Pin className="w-3 h-3 text-blue-500 shrink-0 fill-blue-500" />
                    )}
                    {note.isLocked && (
                      <Lock
                        className={`w-3 h-3 shrink-0 ${
                          isVaultUnlocked ? 'text-emerald-500' : 'text-amber-500'
                        }`}
                      />
                    )}
                    <h4
                      className={`text-xs font-semibold truncate ${
                        isSelected ? 'text-slate-900' : 'text-slate-800'
                      }`}
                    >
                      {note.title || 'Untitled Note'}
                    </h4>
                  </div>

                  {/* Actions on hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    {!isTrashView ? (
                      <>
                        <button
                          onClick={(e) => onToggleStar(note.id, e)}
                          title={note.isStarred ? 'Unstar' : 'Star'}
                          className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              note.isStarred ? 'text-amber-500 fill-amber-500' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => onTogglePin(note.id, e)}
                          title={note.isPinned ? 'Unpin' : 'Pin to top'}
                          className="p-1 text-slate-400 hover:text-blue-500 transition-colors"
                        >
                          <Pin
                            className={`w-3.5 h-3.5 ${
                              note.isPinned ? 'text-blue-500 fill-blue-500' : ''
                            }`}
                          />
                        </button>
                        <button
                          onClick={(e) => onDeleteNote(note.id, e)}
                          title="Move to Trash"
                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={(e) => onRestoreNote(note.id, e)}
                          title="Restore note"
                          className="p-1 text-slate-400 hover:text-emerald-600 transition-colors"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => onPermanentDeleteNote(note.id, e)}
                          title="Permanently delete"
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Excerpt Snippet */}
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2 font-normal">
                  {previewText}
                </p>

                {/* Unboxed Metadata (Zero-Pill Discipline with · separators) */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 tabular-nums">
                  <span>{formatDate(note.updatedAt)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="capitalize">{note.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{formatBytes(noteBytes, 0)}</span>

                  {note.attachments.length > 0 && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-0.5 text-slate-500">
                        <Paperclip className="w-2.5 h-2.5" />
                        <span>{note.attachments.length}</span>
                      </span>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
