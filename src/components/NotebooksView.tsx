import React, { useState } from 'react';
import { Folder, Plus, FileText, ArrowRight, HardDrive } from 'lucide-react';
import { Note, Category } from '../types';
import { formatBytes, getUtf8ByteSize } from '../utils/storage';

interface NotebooksViewProps {
  categories: Category[];
  notes: Note[];
  onSelectCategory: (catId: string) => void;
  onAddCategory: (name: string) => void;
}

export const NotebooksView: React.FC<NotebooksViewProps> = ({
  categories,
  notes,
  onSelectCategory,
  onAddCategory,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [nameInput, setNameInput] = useState('');

  const activeNotes = notes.filter((n) => !n.isDeleted);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;
    onAddCategory(nameInput.trim());
    setNameInput('');
    setIsCreating(false);
  };

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">Notebooks &amp; Workspaces</h2>
            <p className="text-xs text-slate-500 mt-1">
              Organize your personal notes into dedicated encrypted cloud notebooks
            </p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Notebook</span>
          </button>
        </div>

        {/* Create form modal/bar */}
        {isCreating && (
          <form
            onSubmit={handleCreate}
            className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex items-center gap-3"
          >
            <Folder className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="e.g. Travel Journal, Tax 2026, Startup Ideas..."
              className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
            >
              Cancel
            </button>
          </form>
        )}

        {/* Notebooks Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories
            .filter((c) => c.id !== 'all')
            .map((cat) => {
              const catNotes = activeNotes.filter((n) => n.category === cat.id);
              const catBytes = catNotes.reduce((sum, n) => {
                const noteBytes =
                  getUtf8ByteSize(n.title) +
                  getUtf8ByteSize(n.content) +
                  n.attachments.reduce((aSum, a) => aSum + a.size, 0);
                return sum + noteBytes;
              }, 0);

              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className="p-5 bg-white border border-slate-200 hover:border-slate-400 rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-white"
                        style={{ backgroundColor: cat.color }}
                      >
                        <Folder className="w-4 h-4" />
                      </div>
                      <span className="text-xs text-slate-400 font-medium tabular-nums">
                        {catNotes.length} {catNotes.length === 1 ? 'note' : 'notes'}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-600 transition-colors mb-1">
                      {cat.name}
                    </h3>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 tabular-nums">
                      <HardDrive className="w-3 h-3 text-slate-400" />
                      <span>{formatBytes(catBytes)} stored</span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-slate-600 group-hover:text-slate-900">
                    <span>Open Notebook</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};
