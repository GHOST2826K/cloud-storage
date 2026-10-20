import React from 'react';
import { Cloud, Lock, Unlock, Plus, HardDrive } from 'lucide-react';
import { VaultSecurityConfig, SubscriptionInfo } from '../types';

interface TopBarProps {
  currentTab: 'notes' | 'notebooks' | 'vault' | 'storage' | 'trash';
  setCurrentTab: (tab: 'notes' | 'notebooks' | 'vault' | 'storage' | 'trash') => void;
  onNewNote: () => void;
  onOpenStorageModal: () => void;
  onToggleVaultLock: () => void;
  securityConfig: VaultSecurityConfig;
  subscription: SubscriptionInfo;
  isSyncing: boolean;
  lastSyncedText: string;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentTab,
  setCurrentTab,
  onNewNote,
  onOpenStorageModal,
  onToggleVaultLock,
  securityConfig,
  subscription,
  isSyncing,
  lastSyncedText,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 sticky top-0 z-30 select-none">
      {/* Zone 1: Single element brand wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setCurrentTab('notes');
          }}
          className="flex items-center gap-2.5 text-base font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <Cloud className="w-4 h-4 text-sky-400" />
          </div>
          <span>CloudVault</span>
        </a>

        {/* Quiet 100GB plan label */}
        <button
          onClick={onOpenStorageModal}
          title="Click to view 100GB Cloud Storage Plan details"
          className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded transition-colors whitespace-nowrap"
        >
          <HardDrive className="w-3 h-3 text-slate-500" />
          <span>{subscription.planId === 'free' ? '5GB Free' : '100GB Cloud'}</span>
        </button>
      </div>

      {/* Zone 2: 4 clean single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
        <button
          onClick={() => setCurrentTab('notes')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'notes' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          All Notes
        </button>
        <button
          onClick={() => setCurrentTab('notebooks')}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'notebooks' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Notebooks
        </button>
        <button
          onClick={() => setCurrentTab('vault')}
          className={`flex items-center gap-1.5 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'vault' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          <span>Encrypted Vault</span>
          {securityConfig.isUnlocked ? (
            <span className="text-[11px] text-emerald-600 font-normal">Unlocked</span>
          ) : (
            <span className="text-[11px] text-slate-400 font-normal">Locked</span>
          )}
        </button>
        <button
          onClick={onOpenStorageModal}
          className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 ${
            currentTab === 'storage' ? 'text-slate-900 font-semibold' : ''
          }`}
        >
          Storage (100GB)
        </button>
      </nav>

      {/* Zone 3: 1 primary action (+ quick lock affordance & sync indicator) */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Sync status indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
            }`}
            aria-hidden="true"
          />
          <span className="tabular-nums">{isSyncing ? 'Syncing...' : lastSyncedText}</span>
        </div>

        {/* Master Vault Lock button */}
        <button
          onClick={onToggleVaultLock}
          title={
            securityConfig.isUnlocked
              ? 'Lock Vault (Zero-knowledge AES-256)'
              : 'Unlock Encrypted Vault'
          }
          className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
            securityConfig.isUnlocked
              ? 'border-slate-200 text-slate-700 hover:bg-slate-50'
              : 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
          }`}
        >
          {securityConfig.isUnlocked ? (
            <>
              <Unlock className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Lock Vault</span>
            </>
          ) : (
            <>
              <Lock className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Unlock Vault</span>
            </>
          )}
        </button>

        {/* Primary Action Button */}
        <button
          onClick={onNewNote}
          className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap shrink-0 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>
    </header>
  );
};
