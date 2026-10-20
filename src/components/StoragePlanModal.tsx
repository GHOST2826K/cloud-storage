import React, { useState } from 'react';
import {
  X,
  Check,
  HardDrive,
  Shield,
  FileText,
  Paperclip,
  History,
  CreditCard,
  Sparkles,
  ArrowRight,
  Receipt,
  Download,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SubscriptionInfo, StorageMetrics } from '../types';
import { STORAGE_LIMIT_FREE, STORAGE_LIMIT_100GB, formatBytes } from '../utils/storage';

interface StoragePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionInfo;
  storageMetrics: StorageMetrics;
  onUpdateSubscription: (newSub: SubscriptionInfo) => void;
}

export const StoragePlanModal: React.FC<StoragePlanModalProps> = ({
  isOpen,
  onClose,
  subscription,
  storageMetrics,
  onUpdateSubscription,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPayment, setSelectedPayment] = useState<'card' | 'apple_pay' | 'google_pay'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);

  if (!isOpen) return null;

  const isPro = subscription.planId === 'pro_100gb' || subscription.planId === 'pro_annual';

  const handleUpgradeTo100GB = (cycle: 'monthly' | 'yearly') => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const newPlan: SubscriptionInfo = {
        planId: cycle === 'monthly' ? 'pro_100gb' : 'pro_annual',
        name: 'CloudVault 100GB Tier',
        price: cycle === 'monthly' ? '$1.00' : '$10.00',
        billingCycle: cycle,
        storageLimitBytes: STORAGE_LIMIT_100GB,
        storageLimitGB: 100,
        renewDate: cycle === 'monthly' ? 'Nov 19, 2026' : 'Oct 19, 2027',
        active: true,
        paymentMethod:
          selectedPayment === 'card'
            ? 'Visa •••• 4242'
            : selectedPayment === 'apple_pay'
            ? 'Apple Pay'
            : 'Google Pay',
        lastInvoiceNumber: `INV-CV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      };
      onUpdateSubscription(newPlan);
      setShowReceipt(true);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });
    }, 600);
  };

  const handleDowngradeToFree = () => {
    const freePlan: SubscriptionInfo = {
      planId: 'free',
      name: 'Free Tier',
      price: '$0.00',
      billingCycle: 'monthly',
      storageLimitBytes: STORAGE_LIMIT_FREE,
      storageLimitGB: 5,
      renewDate: 'Never',
      active: true,
      paymentMethod: 'None',
    };
    onUpdateSubscription(freePlan);
    setShowReceipt(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
              <HardDrive className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cloud Storage &amp; Plans</h2>
              <p className="text-xs text-slate-500">
                Store unlimited personal notes securely with high-grade zero-knowledge encryption
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Storage Meter Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-800">Storage Usage Breakdown</span>
              <span className="text-xs text-slate-500 tabular-nums">
                <strong className="text-slate-900">{storageMetrics.formattedUsed}</strong> of{' '}
                {storageMetrics.formattedLimit} ({storageMetrics.percentage.toFixed(2)}%)
              </span>
            </div>

            {/* Segmented bar */}
            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex mb-3">
              <div
                className="bg-sky-500 h-full"
                style={{
                  width: `${Math.max(0.5, (storageMetrics.notesBytes / storageMetrics.limitBytes) * 100)}%`,
                }}
                title={`Notes: ${formatBytes(storageMetrics.notesBytes)}`}
              />
              <div
                className="bg-emerald-500 h-full"
                style={{
                  width: `${Math.max(0.5, (storageMetrics.attachmentsBytes / storageMetrics.limitBytes) * 100)}%`,
                }}
                title={`Attachments: ${formatBytes(storageMetrics.attachmentsBytes)}`}
              />
              <div
                className="bg-purple-500 h-full"
                style={{
                  width: `${Math.max(0.5, (storageMetrics.revisionsBytes / storageMetrics.limitBytes) * 100)}%`,
                }}
                title={`History: ${formatBytes(storageMetrics.revisionsBytes)}`}
              />
            </div>

            {/* Legend with tabular sizes */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500 shrink-0" />
                <span className="truncate">Notes:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatBytes(storageMetrics.notesBytes)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate">Files:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatBytes(storageMetrics.attachmentsBytes)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0" />
                <span className="truncate">History:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatBytes(storageMetrics.revisionsBytes)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                <span className="truncate">Headroom:</span>
                <span className="font-semibold text-slate-800 tabular-nums">
                  {formatBytes(storageMetrics.limitBytes - storageMetrics.totalBytes)}
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Free Tier */}
            <div
              className={`p-5 rounded-xl border transition-all ${
                !isPro ? 'border-slate-400 bg-white shadow-xs ring-1 ring-slate-400' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Free Starter</span>
                {!isPro && (
                  <span className="text-[11px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                    Current Plan
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-slate-900 tabular-nums">$0</span>
                  <span className="text-xs text-slate-500">/ forever</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">5 GB secure cloud storage</p>
              </div>

              <ul className="space-y-2 text-xs text-slate-600 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span>5 GB Cloud Storage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span>Unlimited text notes</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span>AES-256 client encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                  <span>Max 25 MB per attachment</span>
                </li>
              </ul>

              {isPro ? (
                <button
                  onClick={handleDowngradeToFree}
                  className="w-full py-2 text-xs font-medium text-slate-700 border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  Downgrade to Free 5GB
                </button>
              ) : (
                <button
                  disabled
                  className="w-full py-2 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg cursor-default"
                >
                  Active Plan
                </button>
              )}
            </div>

            {/* 100GB Cloud Tier - $1/mo (FEATURED) */}
            <div
              className={`p-5 rounded-xl border relative transition-all ${
                isPro
                  ? 'border-sky-600 bg-sky-50/20 shadow-md ring-2 ring-sky-500'
                  : 'border-slate-900 bg-white shadow-md'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-sky-600 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>100GB Pro Vault</span>
                </span>
                {isPro && (
                  <span className="text-[11px] text-sky-700 font-semibold bg-sky-100 px-2 py-0.5 rounded">
                    Active Plan
                  </span>
                )}
              </div>

              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900 tabular-nums">
                    {billingCycle === 'monthly' ? '$1.00' : '$10.00'}
                  </span>
                  <span className="text-xs text-slate-500">
                    {billingCycle === 'monthly' ? '/ month' : '/ year (save $2)'}
                  </span>
                </div>
                <p className="text-xs text-sky-700 font-medium mt-1">
                  <strong>100 GB</strong> Ultra-fast encrypted cloud storage
                </p>
              </div>

              {/* Cadence switch */}
              <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg mb-4 text-xs">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`flex-1 py-1 rounded font-medium transition-colors ${
                    billingCycle === 'monthly'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  $1 / month
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`flex-1 py-1 rounded font-medium transition-colors ${
                    billingCycle === 'yearly'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  $10 / year
                </button>
              </div>

              <ul className="space-y-2 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span><strong>100 GB</strong> Cloud Storage (107.3 Billion Bytes)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Unlimited personal notes &amp; folders</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Zero-Knowledge AES-256-GCM encryption</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Large attachments up to 500 MB per file</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                  <span>Permanent revision history &amp; instant restores</span>
                </li>
              </ul>

              {isPro ? (
                <div className="space-y-2">
                  <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg flex items-center justify-between">
                    <span>Active Subscription: {subscription.price} / {subscription.billingCycle}</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <button
                    onClick={() => setShowReceipt(true)}
                    className="w-full py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1"
                  >
                    <Receipt className="w-3 h-3" />
                    <span>View Latest Invoice / Receipt</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleUpgradeTo100GB(billingCycle)}
                  disabled={isProcessing}
                  className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <span>Activating 100GB Vault...</span>
                  ) : (
                    <>
                      <span>Activate 100GB for {billingCycle === 'monthly' ? '$1.00' : '$10.00'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Payment Method Selector if not subscribed */}
          {!isPro && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <span className="text-xs font-semibold text-slate-800 block mb-2">
                Simulated Payment Gateway ($1.00 USD)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setSelectedPayment('card')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    selectedPayment === 'card'
                      ? 'bg-white border-slate-900 text-slate-900 shadow-2xs'
                      : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Card</span>
                </button>
                <button
                  onClick={() => setSelectedPayment('apple_pay')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    selectedPayment === 'apple_pay'
                      ? 'bg-white border-slate-900 text-slate-900 shadow-2xs'
                      : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                  }`}
                >
                  <span>Apple Pay</span>
                </button>
                <button
                  onClick={() => setSelectedPayment('google_pay')}
                  className={`py-2 px-3 rounded-lg border text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    selectedPayment === 'google_pay'
                      ? 'bg-white border-slate-900 text-slate-900 shadow-2xs'
                      : 'border-slate-200 text-slate-600 bg-white hover:border-slate-300'
                  }`}
                >
                  <span>Google Pay</span>
                </button>
              </div>
            </div>
          )}

          {/* Receipt Modal View if requested */}
          {showReceipt && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-slate-800">
              <div className="flex items-center justify-between font-semibold text-emerald-900 mb-1">
                <span>Payment Confirmed &amp; 100GB Active</span>
                <span className="font-mono text-[11px]">{subscription.lastInvoiceNumber}</span>
              </div>
              <p className="text-slate-600 text-[11px] mb-3">
                Billed {subscription.price} on {subscription.paymentMethod}. Next renewal: {subscription.renewDate}.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowReceipt(false)}
                  className="px-3 py-1 bg-white border border-emerald-300 hover:bg-emerald-50 text-emerald-800 rounded text-[11px] font-medium"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encrypted cloud storage with 99.99% durability</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
