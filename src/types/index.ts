export interface NoteAttachment {
  id: string;
  name: string;
  type: string;
  size: number; // in bytes
  dataUrl: string;
  uploadedAt: number;
}

export interface NoteRevision {
  id: string;
  timestamp: number;
  title: string;
  content: string;
  size: number; // in bytes
}

export interface Note {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  isPinned: boolean;
  isStarred: boolean;
  isLocked: boolean; // protected with master vault passphrase
  color?: string; // accent color
  createdAt: number;
  updatedAt: number;
  isDeleted: boolean;
  deletedAt?: number;
  attachments: NoteAttachment[];
  revisions: NoteRevision[];
  // Encrypted fields when note is locked in zero-knowledge mode:
  encryptedData?: {
    ciphertext: string;
    iv: string;
    salt: string;
  };
}

export type SubscriptionPlanId = 'free' | 'pro_100gb' | 'pro_annual';

export interface SubscriptionInfo {
  planId: SubscriptionPlanId;
  name: string;
  price: string;
  storageLimitBytes: number; // 5GB for free (5,368,709,120), 100GB for pro (107,374,182,400)
  storageLimitGB: number;
  billingCycle: 'monthly' | 'yearly';
  renewDate: string;
  active: boolean;
  paymentMethod?: string;
  lastInvoiceNumber?: string;
}

export interface StorageMetrics {
  totalBytes: number;
  notesBytes: number;
  attachmentsBytes: number;
  revisionsBytes: number;
  limitBytes: number;
  percentage: number;
  formattedUsed: string;
  formattedLimit: string;
}

export interface VaultSecurityConfig {
  isConfigured: boolean;
  isUnlocked: boolean;
  passphraseHash?: string;
  recoveryKey?: string;
  autoLockMinutes: number; // 1, 5, 15, 30, 0 (never)
  lastUnlockedTime: number;
  algorithm: string;
}

export type NoteSortOption = 'updated-desc' | 'updated-asc' | 'created-desc' | 'title-asc' | 'size-desc';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  color: string;
}
