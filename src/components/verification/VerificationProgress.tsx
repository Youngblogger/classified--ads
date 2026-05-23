'use client';

import { Check, X, BadgeCheck, Phone, Mail, IdCard } from 'lucide-react';

interface VerificationProgressProps {
  progress: {
    phone_verified: boolean;
    email_verified: boolean;
    identity_verified: boolean;
    completed: number;
    total: number;
    is_full_verified_seller: boolean;
  };
}

const steps = [
  { key: 'phone_verified' as const, label: 'Phone Verification', icon: Phone },
  { key: 'email_verified' as const, label: 'Email Verification', icon: Mail },
  { key: 'identity_verified' as const, label: 'Government ID Verification', icon: IdCard },
];

export default function VerificationProgress({ progress }: VerificationProgressProps) {
  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl shadow-card p-6 space-y-5">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">Verification Progress</h3>
          <span className="text-sm font-medium text-gray-500">{progress.completed}/{progress.total}</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          const done = progress[step.key];
          return (
            <div key={step.key} className="flex items-center gap-3">
              <div className={`p-1.5 rounded-lg ${done ? 'bg-green-50' : 'bg-gray-100'}`}>
                <Icon className={`w-4 h-4 ${done ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <span className={`flex-1 text-sm ${done ? 'text-green-700 font-medium' : 'text-gray-500'}`}>
                {step.label}
              </span>
              {done ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <X className="w-4 h-4 text-gray-300" />
              )}
            </div>
          );
        })}
      </div>

      <div className={`p-4 rounded-xl ${progress.is_full_verified_seller ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
        <div className="flex items-start gap-3">
          <BadgeCheck className={`w-5 h-5 mt-0.5 flex-shrink-0 ${progress.is_full_verified_seller ? 'text-[#1d9bf0]' : 'text-gray-300'}`} />
          <div>
            <p className={`text-sm font-semibold ${progress.is_full_verified_seller ? 'text-green-700' : 'text-gray-600'}`}>
              {progress.is_full_verified_seller ? 'Verified Seller Badge Active!' : 'Unlock Your Verified Seller Badge'}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {progress.is_full_verified_seller
                ? 'Your blue checkmark badge is now visible across the marketplace.'
                : 'Complete all 3 steps to unlock your blue Verified Seller badge.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
