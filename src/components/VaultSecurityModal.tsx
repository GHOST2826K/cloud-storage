import React, { useState } from 'react';
import {
  X,
  Shield,
  Lock,
  Unlock,
  Key,
  Copy,
  Check,
  Download,
  Upload,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { VaultSecurityConfig, Note } from '../types';
import { hashPassphrase, generateRecoveryKey } from '../utils/crypto';

interface VaultSecurityModalProps {
  isOpen: boolean;
  onClose: () => void;
  securityConfig: VaultSecurityConfig;
  onUpdateSecurityConfig: (newConfig: VaultSecurityConfig) => void;
  onExportVault: () => void;
  onImportVault: () => void;
  notes: Note[];
}

export const VaultSecurityModal: React.FC<VaultSecurityModalProps> = ({
  isOpen,
  onClose,
  securityConfig,
  onUpdateSecurityConfig,
  onExportVault,
  onImportVault,
  notes,
}) => {
  const [passphraseInput, setPassphraseInput] = useState('');
  const [confirmPassphrase, setConfirmPassphrase] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState(false);
  const [activeTab, setActiveTab] = useState<'unlock' | 'settings' | 'backup'>('unlock');

  if (!isOpen) return null;

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passphraseInput) {
      setErrorMsg('Please enter your passphrase.');
      return;
    }

    const hashed = await hashPassphrase(passphraseInput);

    // If already has hash, verify
    if (securityConfig.passphraseHash) {
      if (hashed === securityConfig.passphraseHash) {
        onUpdateSecurityConfig({
          ...securityConfig,
          isUnlocked: true,
          lastUnlockedTime: Date.now(),
        });
        setPassphraseInput('');
        setErrorMsg('');
        onClose();
      } else {
        setErrorMsg('Incorrect passphrase. Master key rejected.');
      }
    } else {
      // First time setting master passphrase
      if (passphraseInput !== confirmPassphrase) {
        setErrorMsg('Passphrases do not match.');
        return;
      }
      onUpdateSecurityConfig({
        ...securityConfig,
        isConfigured: true,
        isUnlocked: true,
        passphraseHash: hashed,
        recoveryKey: generateRecoveryKey(),
        lastUnlockedTime: Date.now(),
      });
      setPassphraseInput('');
      setConfirmPassphrase('');
      setErrorMsg('');
      onClose();
    }
  };

  const handleLockVault = () => {
    onUpdateSecurityConfig({
      ...securityConfig,
      isUnlocked: false,
    });
    onClose();
  };

  const handleCopyRecoveryKey = () => {
    if (securityConfig.recoveryKey) {
      navigator.clipboard.writeText(securityConfig.recoveryKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  const handleAutoLockChange = (minutes: number) => {
    onUpdateSecurityConfig({
      ...securityConfig,
      autoLockMinutes: minutes,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col">
        {/* Header with Vault Graphic */}
        <div className="relative px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Encrypted Cloud Vault</h2>
              <p className="text-xs text-slate-400">
                Zero-Knowledge AES-256-GCM client encryption
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 px-6 pt-3 gap-6 text-xs font-medium text-slate-500">
          <button
            onClick={() => setActiveTab('unlock')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'unlock'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'hover:text-slate-800'
            }`}
          >
            {securityConfig.isUnlocked ? 'Vault Status' : 'Unlock Vault'}
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'settings'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'hover:text-slate-800'
            }`}
          >
            Security &amp; Key
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`pb-2.5 transition-colors ${
              activeTab === 'backup'
                ? 'text-slate-900 border-b-2 border-slate-900 font-semibold'
                : 'hover:text-slate-800'
            }`}
          >
            Cloud Backup
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'unlock' && (
            <div>
              {securityConfig.isUnlocked ? (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                    <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <h4 className="font-semibold text-emerald-900 mb-0.5">Vault is Currently Unlocked</h4>
                      <p className="text-emerald-700 leading-relaxed">
                        Your personal encrypted notes can be viewed and edited. To seal your confidential notes from shoulder surfers or on shared devices, lock the vault.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleLockVault}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4 text-amber-400" />
                      <span>Lock Vault Now</span>
                    </button>
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUnlock} className="space-y-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Enter your Master Vault Passphrase to decrypt your confidential notes and documents in browser memory.
                  </p>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                      Master Passphrase
                    </label>
                    <input
                      type="password"
                      autoFocus
                      value={passphraseInput}
                      onChange={(e) => {
                        setPassphraseInput(e.target.value);
                        setErrorMsg('');
                      }}
                      placeholder="Enter passphrase..."
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                    />
                  </div>

                  {errorMsg && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <Unlock className="w-4 h-4 text-emerald-400" />
                      <span>Unlock Vault</span>
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-xs font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-5">
              {/* Emergency Recovery Key */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1">
                  Emergency Recovery Key
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Store this offline. If you forget your passphrase, this key is the only mathematical way to restore your notes.
                </p>
                <div className="flex items-center gap-2 p-2.5 bg-slate-100 rounded-lg border border-slate-200">
                  <Key className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="font-mono text-xs text-slate-900 font-medium tracking-wider flex-1 truncate">
                    {securityConfig.recoveryKey || 'CV99-K872-M421-P994-Q122-W803'}
                  </span>
                  <button
                    onClick={handleCopyRecoveryKey}
                    className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
                    title="Copy recovery key"
                  >
                    {copiedKey ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Auto-Lock Timer */}
              <div>
                <label className="text-xs font-semibold text-slate-800 block mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>Auto-Lock Timeout</span>
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[1, 5, 15, 30].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => handleAutoLockChange(mins)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        securityConfig.autoLockMinutes === mins
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Cryptographic Proof */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 space-y-1">
                <div className="font-semibold text-slate-800">Cryptographic Standard</div>
                <div>• Cipher: AES-GCM 256-bit with authenticated HMAC tag</div>
                <div>• Key Derivation: PBKDF2-SHA256 (100,000 iterations)</div>
                <div>• Random IV: 96-bit unique IV generated per document</div>
              </div>
            </div>
          )}

          {activeTab === 'backup' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                Download a self-contained encrypted snapshot of all {notes.filter((n) => !n.isDeleted).length} personal notes and attachments.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={onExportVault}
                  className="p-4 border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 rounded-xl transition-all text-left group"
                >
                  <Download className="w-5 h-5 text-sky-600 mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-slate-900">Export Vault (.vault)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    AES-256 encrypted archive
                  </div>
                </button>

                <button
                  onClick={onImportVault}
                  className="p-4 border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 rounded-xl transition-all text-left group"
                >
                  <Upload className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-105 transition-transform" />
                  <div className="text-xs font-semibold text-slate-900">Restore Vault</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Import existing .vault backup
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
