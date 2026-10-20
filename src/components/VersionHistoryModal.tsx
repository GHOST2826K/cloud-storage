import React, { useState } from 'react';
import { X, History, RotateCcw, Plus, Clock, FileText } from 'lucide-react';
import { Note, NoteRevision } from '../types';
import { formatBytes } from '../utils/storage';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onRestoreRevision: (revision: NoteRevision) => void;
  onCreateSnapshot: () => void;
}

export const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  isOpen,
  onClose,
  note,
  onRestoreRevision,
  onCreateSnapshot,
}) => {
  const [selectedRevision, setSelectedRevision] = useState<NoteRevision | null>(null);

  if (!isOpen || !note) return null;

  const currentRevision = selectedRevision || note.revisions[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col h-[600px]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Revision History · &quot;{note.title || 'Untitled'}&quot;
              </h3>
              <p className="text-xs text-slate-500">
                Infinite revision tracking enabled on your 100GB Cloud Vault
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onCreateSnapshot}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3 h-3" />
              <span>Save Snapshot</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-column layout: Revision list & preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Revisions list */}
          <div className="w-72 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
            {note.revisions.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                <Clock className="w-6 h-6 text-slate-400 mx-auto mb-2 opacity-60" />
                <p className="font-medium text-slate-700 mb-1">No Past Snapshots</p>
                <p className="text-[11px] leading-relaxed">
                  Snapshots are automatically captured during editing or you can click &quot;Save Snapshot&quot; above.
                </p>
              </div>
            ) : (
              note.revisions.map((rev) => {
                const isSelected = currentRevision?.id === rev.id;
                const date = new Date(rev.timestamp);
                return (
                  <div
                    key={rev.id}
                    onClick={() => setSelectedRevision(rev)}
                    className={`p-3.5 cursor-pointer transition-colors text-xs ${
                      isSelected
                        ? 'bg-white font-medium text-slate-900 border-l-2 border-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:bg-slate-100/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-800">
                        {date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mb-1">
                      {rev.title || 'Untitled'}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono tabular-nums">
                      Size: {formatBytes(rev.size || 0)}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right: Revision Content Preview */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {currentRevision ? (
              <>
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                  <div className="text-xs text-slate-600 truncate">
                    <span>Snapshot from </span>
                    <strong className="text-slate-900">
                      {new Date(currentRevision.timestamp).toLocaleString()}
                    </strong>
                  </div>
                  <button
                    onClick={() => {
                      onRestoreRevision(currentRevision);
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore this Version</span>
                  </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto">
                  <h4 className="text-base font-bold text-slate-900 mb-3">
                    {currentRevision.title}
                  </h4>
                  <pre className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {currentRevision.content}
                  </pre>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-xs text-slate-400">
                <FileText className="w-8 h-8 text-slate-300 mb-2" />
                <span>Select a snapshot from the left to inspect content.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
