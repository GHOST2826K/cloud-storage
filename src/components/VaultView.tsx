import React from 'react';
import {
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  Shield,
  FileText,
  Clock,
  ArrowRight,
  HardDrive,
} from 'lucide-react';
import { Note, VaultSecurityConfig } from '../types';
import { formatBytes, getUtf8ByteSize } from '../utils/storage';

interface VaultViewProps {
  notes: Note[];
  securityConfig: VaultSecurityConfig;
  onToggleVaultLock: () => void;
  onOpenSecurityModal: () => void;
  onSelectNote: (id: string) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  notes,
  securityConfig,
  onToggleVaultLock,
  onOpenSecurityModal,
  onSelectNote,
}) => {
  const lockedNotes = notes.filter((n) => !n.isDeleted && n.isLocked);

  const totalVaultBytes = lockedNotes.reduce((sum, n) => {
    return (
      sum +
      getUtf8ByteSize(n.title) +
      getUtf8ByteSize(n.content) +
      n.attachments.reduce((aSum, a) => aSum + a.size, 0)
    );
  }, 0);

  return (
    <div className="flex-1 p-8 bg-slate-50 overflow-y-auto select-none">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Encrypted Cloud Vault
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Zero-Knowledge AES-256-GCM client-side encryption. Passphrase never touches the network.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleVaultLock}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 ${
                securityConfig.isUnlocked
                  ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                  : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
              }`}
            >
              {securityConfig.isUnlocked ? (
                <>
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Lock Vault</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Unlock Vault</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenSecurityModal}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Security Settings
            </button>
          </div>
        </div>

        {/* Security Status Panel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Encryption Status</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-0.5">
              {securityConfig.isUnlocked ? 'Vault Unlocked' : 'Vault Locked & Sealed'}
            </div>
            <p className="text-[11px] text-slate-500">
              {securityConfig.isUnlocked
                ? 'Decrypted in local browser memory'
                : 'All documents ciphertext protected'}
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
              <Key className="w-4 h-4 text-sky-600" />
              <span>Cipher Spec</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-0.5 font-mono">
              AES-GCM-256
            </div>
            <p className="text-[11px] text-slate-500">
              PBKDF2 SHA-256 (100k rounds)
            </p>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 mb-1">
              <HardDrive className="w-4 h-4 text-purple-600" />
              <span>Encrypted Footprint</span>
            </div>
            <div className="text-sm font-bold text-slate-900 mb-0.5 tabular-nums">
              {formatBytes(totalVaultBytes)}
            </div>
            <p className="text-[11px] text-slate-500">
              Across {lockedNotes.length} sealed personal notes
            </p>
          </div>
        </div>

        {/* Encrypted Notes List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
              Protected Documents ({lockedNotes.length})
            </h3>
            <span className="text-[11px] text-slate-400">
              Auto-locks after {securityConfig.autoLockMinutes} minutes of inactivity
            </span>
          </div>

          {lockedNotes.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              <Lock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700 mb-1">No Locked Notes</p>
              <p className="text-[11px]">
                To protect any note with zero-knowledge AES-256 encryption, open the note and click &quot;Encrypt Note&quot;.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {lockedNotes.map((note) => {
                const noteBytes =
                  getUtf8ByteSize(note.title) +
                  getUtf8ByteSize(note.content) +
                  note.attachments.reduce((sum, a) => sum + a.size, 0);

                return (
                  <div
                    key={note.id}
                    onClick={() => onSelectNote(note.id)}
                    className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-900 truncate group-hover:text-sky-600 transition-colors">
                          {note.title}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-2 tabular-nums">
                          <span>Updated {new Date(note.updatedAt).toLocaleDateString()}</span>
                          <span aria-hidden="true">·</span>
                          <span>{formatBytes(noteBytes)}</span>
                          {note.attachments.length > 0 && (
                            <>
                              <span aria-hidden="true">·</span>
                              <span>{note.attachments.length} files</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500 group-hover:text-slate-900 shrink-0">
                      <span>Open in Editor</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
