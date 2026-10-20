import { Note, SubscriptionInfo, StorageMetrics, VaultSecurityConfig, Category } from '../types';

export const STORAGE_LIMIT_FREE = 5 * 1024 * 1024 * 1024; // 5 GB
export const STORAGE_LIMIT_100GB = 100 * 1024 * 1024 * 1024; // 100 GB (107,374,182,400 bytes)

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'all', name: 'All Notes', iconName: 'FileText', color: '#64748B' },
  { id: 'personal', name: 'Personal', iconName: 'User', color: '#3B82F6' },
  { id: 'security', name: 'Security Vault', iconName: 'Shield', color: '#10B981' },
  { id: 'work', name: 'Projects & Work', iconName: 'Briefcase', color: '#8B5CF6' },
  { id: 'finance', name: 'Finances', iconName: 'CreditCard', color: '#F59E0B' },
  { id: 'ideas', name: 'Ideas & Drafts', iconName: 'Lightbulb', color: '#EC4899' },
];

export const INITIAL_SUBSCRIPTION: SubscriptionInfo = {
  planId: 'pro_100gb',
  name: 'CloudVault 100GB Tier',
  price: '$1.00',
  billingCycle: 'monthly',
  storageLimitBytes: STORAGE_LIMIT_100GB,
  storageLimitGB: 100,
  renewDate: 'Nov 19, 2026',
  active: true,
  paymentMethod: 'Cloud Billing · Visa •••• 4242',
  lastInvoiceNumber: 'INV-CV-2026-90412',
};

export const INITIAL_SECURITY_CONFIG: VaultSecurityConfig = {
  isConfigured: true,
  isUnlocked: true,
  passphraseHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', // initial test hash or empty
  recoveryKey: 'CV99-K872-M421-P994-Q122-W803',
  autoLockMinutes: 15,
  lastUnlockedTime: Date.now(),
  algorithm: 'AES-GCM-256 (WebCrypto)',
};

export const INITIAL_NOTES: Note[] = [
  {
    id: 'note-welcome-100gb',
    title: 'CloudVault: 100GB Unlimited Notes at $1/Month',
    content: `# Welcome to CloudVault 100GB

You are currently on the **100 GB Cloud Vault Tier ($1.00 / month)**. 

### What does 100GB give you?
- **Unlimited Text Notes**: 100 GB fits over **50,000,000 pages** of rich Markdown notes!
- **High-Resolution Media Attachments**: Store thousands of scanned PDFs, blueprints, photos, audio memos, and archives.
- **Client-Side Zero-Knowledge Encryption**: Every note can be locked with **AES-256-GCM** before touching cloud relays.
- **Full Revision History**: Continuous snapshot versioning with zero fear of accidental deletion.

---

### Key Capabilities at a Glance

| Feature | Free Tier | Pro 100GB ($1/mo) |
| :--- | :--- | :--- |
| **Cloud Storage** | 5 GB | **100 GB** |
| **Price** | $0.00 | **$1.00 / month** |
| **Max Note Count** | Unlimited | **Unlimited** |
| **Max Attachment Size** | 25 MB | **500 MB per file** |
| **Zero-Knowledge AES-256** | Included | **Included** |
| **Revision History** | 7 Days | **Permanent / Infinite** |
| **Encrypted Vault Export** | Included | **Included** |

---

### Quick Actions to Try
1. Click **"+ New Note"** in the top bar to create your thoughts.
2. Click **"Storage (100GB)"** in the top bar or sidebar to inspect your real-time byte breakdown.
3. Test **Lock Note / Encrypted Vault** to verify client-side zero-knowledge security.
4. Drag & drop image files or documents into the attachments drawer below.`,
    category: 'personal',
    tags: ['welcome', '100gb-tier', 'guide'],
    isPinned: true,
    isStarred: true,
    isLocked: false,
    color: '#3B82F6',
    createdAt: Date.now() - 3600000 * 24 * 3,
    updatedAt: Date.now() - 3600000 * 2,
    isDeleted: false,
    attachments: [
      {
        id: 'att-1',
        name: 'cloud_vault_specs.pdf',
        type: 'application/pdf',
        size: 245800, // ~240 KB
        dataUrl: '',
        uploadedAt: Date.now() - 3600000 * 24,
      },
    ],
    revisions: [
      {
        id: 'rev-1',
        timestamp: Date.now() - 3600000 * 48,
        title: 'Initial Note Blueprint',
        content: '# Welcome to CloudVault\nYour personal encrypted storage.',
        size: 58,
      },
    ],
  },
  {
    id: 'note-security-architecture',
    title: 'Zero-Knowledge Cryptographic Specification',
    content: `## Architecture: Zero-Knowledge Client-Side Vault

CloudVault enforces an absolute **Zero-Knowledge Privacy Guarantee**. All encryption and decryption operations execute exclusively in your client's browser memory via the native **W3C Web Cryptography API**.

### Cryptographic Parameters
- **Cipher Algorithm**: AES-GCM (Galois/Counter Mode) with 256-bit key length.
- **Key Derivation Function (KDF)**: PBKDF2 with HMAC-SHA256.
- **Iteration Count**: 100,000 iterations to withstand GPU/ASIC brute-force dictionary attacks.
- **Initialization Vector (IV)**: 96-bit cryptographically random IV generated via \`crypto.getRandomValues()\` for every individual encryption.
- **Salt**: Unique 128-bit cryptographically secure salt generated per vault.

\`\`\`typescript
// Client-side execution example
const key = await window.crypto.subtle.deriveKey(
  { name: 'PBKDF2', salt, iterations: 100_000, hash: 'SHA-256' },
  baseKey,
  { name: 'AES-GCM', length: 256 },
  false,
  ['encrypt', 'decrypt']
);
\`\`\`

### Invariants:
1. Server nodes only store opaque hexadecimal ciphertext.
2. Your master passphrase never traverses network boundaries.
3. If you forget your passphrase and lose your 24-character recovery key, data cannot be recovered by any party.`,
    category: 'security',
    tags: ['security', 'crypto', 'zero-knowledge', 'aes-256'],
    isPinned: true,
    isStarred: true,
    isLocked: false,
    color: '#10B981',
    createdAt: Date.now() - 3600000 * 24 * 5,
    updatedAt: Date.now() - 3600000 * 8,
    isDeleted: false,
    attachments: [],
    revisions: [],
  },
  {
    id: 'note-finance-2026',
    title: '2026 Wealth & Asset Allocation Model',
    content: `## Personal Financial Allocation & Runways

Target annual savings rate: **42%** of net income.

### Portfolio Allocations
- [x] Maximize Tax-Advantaged Retirement Index Accounts
- [x] Maintain 6 Months Liquid High-Yield Emergency Reserve
- [ ] Rebalance Core Global Equity ETFs quarterly
- [ ] Evaluate real estate syndication tranche B

### Liquidity & Reserve Breakdown
| Asset Class | Target Ratio | Current Weight | Yield / Return |
| :--- | :--- | :--- | :--- |
| Global Equities (MSCI World) | 60% | 62.4% | ~8.4% annualized |
| Treasury & High-Yield Cash | 20% | 19.8% | 4.85% APY |
| Venture & Private Equities | 10% | 9.2% | Long Horizon |
| Precious Metals & Bitcoin Vault | 10% | 8.6% | Hedge |

*Notes: All sensitive tax identification numbers and private banking routing codes are stored in the locked vault section.*`,
    category: 'finance',
    tags: ['finance', 'wealth', 'budget', '2026'],
    isPinned: false,
    isStarred: false,
    isLocked: false,
    color: '#F59E0B',
    createdAt: Date.now() - 3600000 * 24 * 7,
    updatedAt: Date.now() - 3600000 * 12,
    isDeleted: false,
    attachments: [],
    revisions: [],
  },
  {
    id: 'note-quantum-roadmap',
    title: 'Distributed Systems & Cloud Sync Engineering',
    content: `### High-Throughput Cloud Synchronization Engine

Design specifications for local-first database replication with conflict-free multi-device synchronization:

#### Core Engine Requirements
1. **Delta-Encoding**: Send only diff patches when updating large documents.
2. **Offline-First Resilience**: All writes mutate the local client index synchronously within 1ms.
3. **Background Sync Worker**: Queued mutations flush to cloud replica endpoints with exponential backoff.
4. **Storage Metering**: Track per-user byte metrics in real-time, enforcing the 100 GB quota boundary.

\`\`\`bash
# Storage quota metric calculation
TOTAL_BYTES = SUM(LENGTH(utf8_notes)) + SUM(attachment_file_bytes) + SUM(revision_bytes)
HEADROOM_GB = (107374182400 - TOTAL_BYTES) / (1024^3)
\`\`\``,
    category: 'work',
    tags: ['engineering', 'systems', 'roadmap'],
    isPinned: false,
    isStarred: false,
    isLocked: false,
    color: '#8B5CF6',
    createdAt: Date.now() - 3600000 * 24 * 10,
    updatedAt: Date.now() - 3600000 * 20,
    isDeleted: false,
    attachments: [],
    revisions: [],
  },
  {
    id: 'note-confidential-passports',
    title: 'Confidential Passports & Family Documents',
    content: `### Confidential Document Vault

> This note contains sensitive personal documentation. Keep locked with the Master Passphrase.

- **Primary Passport Number**: USA-928491823 (Expires: Oct 2032)
- **Global Entry KTN**: 982019482
- **Driver License**: CA-D9481029
- **Health Insurance Policy ID**: BCBS-902-1849102-01

#### Emergency Family Contacts
- Emergency Contact: Sarah Miller (+1-555-019-2834)
- Family Attorney: Mark Henderson, Esq. (Boston, MA)`,
    category: 'security',
    tags: ['passports', 'confidential', 'emergency', 'family'],
    isPinned: false,
    isStarred: true,
    isLocked: true, // Marked as locked
    color: '#EC4899',
    createdAt: Date.now() - 3600000 * 24 * 14,
    updatedAt: Date.now() - 3600000 * 30,
    isDeleted: false,
    attachments: [],
    revisions: [],
  },
];

/**
 * Helper to calculate byte size of a UTF-8 string
 */
export function getUtf8ByteSize(str: string): number {
  return new TextEncoder().encode(str).length;
}

/**
 * Format bytes into human readable KB, MB, GB with tabular numerals
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Calculate accurate storage metrics for all notes, attachments, and revisions
 */
export function calculateStorageMetrics(notes: Note[], limitBytes: number): StorageMetrics {
  let notesBytes = 0;
  let attachmentsBytes = 0;
  let revisionsBytes = 0;

  for (const note of notes) {
    if (note.isDeleted) continue;

    // Note title + content + tags
    notesBytes += getUtf8ByteSize(note.title);
    notesBytes += getUtf8ByteSize(note.content);
    notesBytes += getUtf8ByteSize(note.tags.join(','));

    // Attachments
    for (const att of note.attachments) {
      attachmentsBytes += att.size;
      // If dataUrl exists, also count payload
      if (att.dataUrl) {
        attachmentsBytes += Math.round(att.dataUrl.length * 0.75); // approx binary size from base64
      }
    }

    // Revisions
    for (const rev of note.revisions) {
      revisionsBytes += rev.size || getUtf8ByteSize(rev.content);
    }
  }

  // Base overhead for metadata and indexes: ~1.2 MB
  const systemOverhead = 1250000;
  const totalBytes = notesBytes + attachmentsBytes + revisionsBytes + systemOverhead;
  const percentage = Math.min(100, Math.max(0.01, (totalBytes / limitBytes) * 100));

  return {
    totalBytes,
    notesBytes,
    attachmentsBytes,
    revisionsBytes,
    limitBytes,
    percentage,
    formattedUsed: formatBytes(totalBytes),
    formattedLimit: formatBytes(limitBytes, 0),
  };
}

const STORAGE_KEYS = {
  NOTES: 'cloudvault_notes_v1',
  SUBSCRIPTION: 'cloudvault_subscription_v1',
  SECURITY: 'cloudvault_security_v1',
  LAST_SYNC: 'cloudvault_last_sync_v1',
};

/**
 * Load saved notes from LocalStorage with fallback to initial set
 */
export function loadNotesFromStorage(): Note[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.NOTES);
    if (!raw) {
      saveNotesToStorage(INITIAL_NOTES);
      return INITIAL_NOTES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_NOTES;
  } catch (err) {
    console.error('Failed to load notes from storage:', err);
    return INITIAL_NOTES;
  }
}

/**
 * Save notes to LocalStorage
 */
export function saveNotesToStorage(notes: Note[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(notes));
  } catch (err) {
    console.error('Failed to save notes to storage:', err);
  }
}

/**
 * Load subscription info
 */
export function loadSubscriptionFromStorage(): SubscriptionInfo {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (!raw) return INITIAL_SUBSCRIPTION;
    return JSON.parse(raw);
  } catch {
    return INITIAL_SUBSCRIPTION;
  }
}

/**
 * Save subscription info
 */
export function saveSubscriptionToStorage(sub: SubscriptionInfo): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
  } catch (err) {
    console.error('Failed to save subscription:', err);
  }
}

/**
 * Load security config
 */
export function loadSecurityConfigFromStorage(): VaultSecurityConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SECURITY);
    if (!raw) return INITIAL_SECURITY_CONFIG;
    return JSON.parse(raw);
  } catch {
    return INITIAL_SECURITY_CONFIG;
  }
}

/**
 * Save security config
 */
export function saveSecurityConfigToStorage(config: VaultSecurityConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save security config:', err);
  }
}
