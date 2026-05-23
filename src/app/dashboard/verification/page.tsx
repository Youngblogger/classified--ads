'use client';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store';
import { verificationApi, businessVerificationApi, emailVerificationApi } from '@/lib/api';
import toast from 'react-hot-toast';
import VerifiedSellerBadge from '@/components/verification/VerifiedSellerBadge';
import BusinessVerifiedBadge from '@/components/verification/BusinessVerifiedBadge';
import VerificationProgress from '@/components/verification/VerificationProgress';
import { Shield, Building2, Phone, Mail, IdCard, Upload, CheckCircle, Clock, XCircle, FileText, AlertCircle, ChevronRight, Loader2, BadgeCheck, Send, RefreshCw, ExternalLink } from 'lucide-react';

interface VerificationItem {
  status: 'approved' | 'pending' | 'rejected' | null;
  value?: string;
  reason?: string;
}

interface VerificationData {
  phone?: VerificationItem;
  email?: VerificationItem;
  identity?: VerificationItem;
}

interface BusinessVerificationData {
  status: 'approved' | 'pending' | 'rejected' | null;
  reason?: string;
  business_name?: string;
  cac_number?: string;
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-card p-6 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gray-200 rounded-xl" />
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded-lg w-32" />
          <div className="h-4 bg-gray-200 rounded-lg w-48" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded-lg w-24" />
        <div className="h-10 bg-gray-200 rounded-xl w-full" />
      </div>
    </div>
  );
}

function ErrorCard({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="bg-white rounded-2xl shadow-card p-8 text-center">
      <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
      <p className="text-sm text-gray-500 mb-3">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
      >
        <Loader2 className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}

function StatusBadge({ status, reason }: { status: VerificationItem['status']; reason?: string }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
        <CheckCircle className="w-4 h-4" />
        Verified
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
        <Clock className="w-4 h-4" />
        Pending Review
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
        <XCircle className="w-4 h-4" />
        Rejected{reason ? `: ${reason}` : ''}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400">
      <XCircle className="w-4 h-4" />
      Not Submitted
    </span>
  );
}

function EmailStatusBadge({ status }: { status: 'not_verified' | 'pending' | 'verified' | 'expired' | 'failed' }) {
  switch (status) {
    case 'verified':
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600">
          <CheckCircle className="w-4 h-4" />
          Verified ✓
        </span>
      );
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600">
          <Clock className="w-4 h-4" />
          Verification Email Sent
        </span>
      );
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
          <AlertCircle className="w-4 h-4" />
          Expired
        </span>
      );
    case 'failed':
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600">
          <XCircle className="w-4 h-4" />
          Failed
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400">
          <AlertCircle className="w-4 h-4" />
          Not Verified
        </span>
      );
  }
}

function FileUploadInput({ id, file, onChange, label, accept = 'image/*,.pdf' }: {
  id: string;
  file: File | null;
  onChange: (f: File | null) => void;
  label: string;
  accept?: string;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-colors"
    >
      <Upload className="w-5 h-5 text-gray-400 flex-shrink-0" />
      <span className="text-sm text-gray-500 truncate flex-1">
        {file ? file.name : label}
      </span>
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.[0]) onChange(e.target.files[0]);
        }}
      />
    </label>
  );
}

const DOCUMENT_TYPES = [
  { value: 'NIN', label: 'National Identification Number (NIN)' },
  { value: 'voters_card', label: "Voter's Card" },
  { value: 'international_passport', label: 'International Passport' },
  { value: 'drivers_license', label: "Driver's License" },
];

export default function VerificationCenterPage() {
  const { user, refreshUser } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [verifications, setVerifications] = useState<VerificationData>({});
  const [businessVerification, setBusinessVerification] = useState<BusinessVerificationData>({ status: null });
  const [bizLoading, setBizLoading] = useState(false);
  const [bizError, setBizError] = useState(false);

  const [phoneSubmitting, setPhoneSubmitting] = useState(false);

  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [emailStatus, setEmailStatus] = useState<'not_verified' | 'pending' | 'verified' | 'expired' | 'failed'>('not_verified');
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [lastEmailSentAt, setLastEmailSentAt] = useState<string | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [identityDocType, setIdentityDocType] = useState('NIN');
  const [identityDocNumber, setIdentityDocNumber] = useState('');
  const [identityFront, setIdentityFront] = useState<File | null>(null);
  const [identityBack, setIdentityBack] = useState<File | null>(null);
  const [identitySelfie, setIdentitySelfie] = useState<File | null>(null);
  const [identitySubmitting, setIdentitySubmitting] = useState(false);

  const [bizName, setBizName] = useState('');
  const [cacNumber, setCacNumber] = useState('');
  const [cacDoc, setCacDoc] = useState<File | null>(null);
  const [addressDoc, setAddressDoc] = useState<File | null>(null);
  const [utilityDoc, setUtilityDoc] = useState<File | null>(null);
  const [taxDoc, setTaxDoc] = useState<File | null>(null);
  const [bizSubmitting, setBizSubmitting] = useState(false);

  const fetchVerifications = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await verificationApi.getMyVerifications();
      const data = res.data?.data || res.data || {};
      setVerifications(data);
    } catch {
      setError(true);
      setVerifications({});
    } finally {
      setLoading(false);
    }
  };

  const fetchBusinessVerification = async () => {
    setBizLoading(true);
    setBizError(false);
    try {
      const res = await businessVerificationApi.getMyVerification();
      const data = res.data?.data || res.data || {};
      setBusinessVerification(data);
    } catch {
      setBizError(true);
      setBusinessVerification({ status: null });
    } finally {
      setBizLoading(false);
    }
  };

  const fetchEmailStatus = async () => {
    try {
      const res = await emailVerificationApi.status();
      const data = res.data;
      if (data.success) {
        setEmailStatus(data.status);
        setEmailCooldown(data.cooldown_remaining || 0);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchVerifications();
    fetchBusinessVerification();
    fetchEmailStatus();
  }, []);

  useEffect(() => {
    if (emailCooldown > 0 && !cooldownRef.current) {
      cooldownRef.current = setInterval(() => {
        setEmailCooldown((prev) => {
          if (prev <= 1) {
            if (cooldownRef.current) clearInterval(cooldownRef.current);
            cooldownRef.current = null;
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (cooldownRef.current) {
        clearInterval(cooldownRef.current);
        cooldownRef.current = null;
      }
    };
  }, [emailCooldown]);

  const handlePhoneVerify = async () => {
    if (!user?.phone) {
      toast.error('No phone number on your profile');
      return;
    }
    setPhoneSubmitting(true);
    try {
      await verificationApi.submitPhone(user.phone);
      toast.success('Phone verified successfully!');
      fetchVerifications();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to verify phone');
    } finally {
      setPhoneSubmitting(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!user?.email) {
      toast.error('No email on your profile');
      return;
    }
    setEmailSubmitting(true);
    try {
      const res = await emailVerificationApi.send(user.email);
      toast.success(res.data?.message || 'Verification email sent successfully. Please check your inbox.');
      setEmailStatus('pending');
      setEmailCooldown(60);
      setLastEmailSentAt(new Date().toISOString());
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to send verification email';
      toast.error(msg);
      if (err.response?.data?.cooldown_remaining) {
        setEmailCooldown(err.response.data.cooldown_remaining);
      }
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleResendVerificationEmail = async () => {
    if (emailCooldown > 0) return;
    setEmailSubmitting(true);
    try {
      const res = await emailVerificationApi.resend();
      toast.success(res.data?.message || 'Verification email sent successfully.');
      setEmailCooldown(60);
      setLastEmailSentAt(new Date().toISOString());
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to resend verification email';
      toast.error(msg);
      if (err.response?.data?.cooldown_remaining) {
        setEmailCooldown(err.response.data.cooldown_remaining);
      }
    } finally {
      setEmailSubmitting(false);
    }
  };

  const handleIdentitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identityDocNumber.trim()) {
      toast.error('Please enter your document number');
      return;
    }
    if (!identityFront) {
      toast.error('Please upload the front of your document');
      return;
    }
    setIdentitySubmitting(true);
    try {
      const formData = new FormData();
      formData.append('document_type', identityDocType);
      formData.append('document_number', identityDocNumber);
      formData.append('document_front', identityFront);
      if (identityBack) formData.append('document_back', identityBack);
      if (identitySelfie) formData.append('document_selfie', identitySelfie);
      await verificationApi.submitIdentity(formData);
      toast.success('Identity verification submitted for review');
      setIdentityDocNumber('');
      setIdentityFront(null);
      setIdentityBack(null);
      setIdentitySelfie(null);
      fetchVerifications();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit identity verification');
    } finally {
      setIdentitySubmitting(false);
    }
  };

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim()) {
      toast.error('Please enter your business name');
      return;
    }
    if (!cacNumber.trim()) {
      toast.error('Please enter your CAC registration number');
      return;
    }
    if (!cacDoc) {
      toast.error('Please upload your CAC certificate');
      return;
    }
    setBizSubmitting(true);
    try {
      const bizFormData = new FormData();
      bizFormData.append('business_name', bizName);
      bizFormData.append('cac_number', cacNumber);
      bizFormData.append('cac_document', cacDoc);
      if (addressDoc) bizFormData.append('address_document', addressDoc);
      if (utilityDoc) bizFormData.append('utility_bill', utilityDoc);
      if (taxDoc) bizFormData.append('tax_registration', taxDoc);
      await businessVerificationApi.submit(bizFormData);
      toast.success('Business verification submitted for review');
      setBizName('');
      setCacNumber('');
      setCacDoc(null);
      setAddressDoc(null);
      setUtilityDoc(null);
      setTaxDoc(null);
      fetchBusinessVerification();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to submit business verification');
    } finally {
      setBizSubmitting(false);
    }
  };

  const phoneStatus = verifications?.phone?.status || null;
  const emailVerifStatus = verifications?.email?.status || null;
  const identityStatus = verifications?.identity?.status || null;
  const identityRejected = verifications?.identity?.reason;
  const bizStatus = businessVerification?.status || null;
  const bizRejected = businessVerification?.reason;

  const personalStepsComplete = [
    phoneStatus === 'approved',
    emailVerifStatus === 'approved',
    identityStatus === 'approved',
  ];
  const completedCount = personalStepsComplete.filter(Boolean).length;
  const allPersonalComplete = completedCount === 3;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Verification Center</h1>
        <p className="text-gray-500 text-sm mt-1">Verify your identity and business to build trust with buyers</p>
      </div>

      {loading || bizLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="space-y-6">
            <SkeletonCard />
          </div>
        </div>
      ) : error ? (
        <ErrorCard message="Failed to load verifications" onRetry={fetchVerifications} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ───── SECTION 1: PERSONAL VERIFICATION ───── */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 bg-blue-100 rounded-xl">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Personal Verification</h2>
                  <p className="text-sm text-gray-500">Complete all 3 steps to unlock your blue Verified Seller badge</p>
                </div>
              </div>
            </div>

            {/* Step 1: Phone Verification */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Step 1: Phone Verification</h3>
                </div>
              </div>
              <div className="space-y-3">
                {user?.phone ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700 font-medium">{user.phone}</span>
                    <StatusBadge status={phoneStatus} />
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">
                    No phone number on your profile.{' '}
                    <a href="/dashboard/profile" className="text-primary-600 hover:text-primary-700 font-medium">
                      Update profile
                    </a>
                  </div>
                )}
                {phoneStatus !== 'approved' && user?.phone && (
                  <button
                    onClick={handlePhoneVerify}
                    disabled={phoneSubmitting}
                    className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {phoneSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <BadgeCheck className="w-4 h-4" />
                    )}
                    {phoneSubmitting ? 'Verifying...' : 'Verify Phone'}
                  </button>
                )}
              </div>
            </div>

            {/* Step 2: Email Verification */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Step 2: Email Verification</h3>
                </div>
              </div>
              <div className="space-y-4">
                {user?.email ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 font-medium truncate">{user.email}</span>
                        <EmailStatusBadge status={emailStatus} />
                      </div>
                    </div>

                    {emailStatus === 'verified' ? (
                      <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                        Your email address has been verified successfully.
                      </div>
                    ) : emailStatus === 'pending' ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
                          <Clock className="w-5 h-5 flex-shrink-0" />
                          Verification email sent. Check your inbox and click the link.
                        </div>
                        {lastEmailSentAt && (
                          <p className="text-xs text-gray-400">
                            Last sent: {new Date(lastEmailSentAt).toLocaleString()}
                          </p>
                        )}
                        <button
                          onClick={handleResendVerificationEmail}
                          disabled={emailSubmitting || emailCooldown > 0}
                          className="w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {emailSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RefreshCw className="w-4 h-4" />
                          )}
                          {emailSubmitting
                            ? 'Sending...'
                            : emailCooldown > 0
                              ? `Resend in ${emailCooldown}s`
                              : 'Resend Verification Email'}
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-500">
                          Verify your email address to unlock account features and build trust with buyers.
                        </p>
                        <button
                          onClick={handleSendVerificationEmail}
                          disabled={emailSubmitting}
                          className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {emailSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          {emailSubmitting ? 'Sending...' : 'Verify Email'}
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-gray-400">
                    No email on your profile.{' '}
                    <a href="/dashboard/profile" className="text-primary-600 hover:text-primary-700 font-medium">
                      Update profile
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Government ID Verification */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <IdCard className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">Step 3: Government ID Verification</h3>
                </div>
              </div>
              <div className="mb-3">
                <StatusBadge status={identityStatus} reason={identityRejected} />
              </div>
              {identityStatus === 'approved' ? (
                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-xl">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Identity Verified</span>
                </div>
              ) : (
                <form onSubmit={handleIdentitySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type</label>
                    <select
                      value={identityDocType}
                      onChange={(e) => setIdentityDocType(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    >
                      {DOCUMENT_TYPES.map((dt) => (
                        <option key={dt.value} value={dt.value}>{dt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Number</label>
                    <input
                      type="text"
                      value={identityDocNumber}
                      onChange={(e) => setIdentityDocNumber(e.target.value)}
                      placeholder="Enter document number"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <FileUploadInput
                    id="id-front"
                    file={identityFront}
                    onChange={setIdentityFront}
                    label="Upload front of document (required)"
                    accept="image/*"
                  />
                  <FileUploadInput
                    id="id-back"
                    file={identityBack}
                    onChange={setIdentityBack}
                    label="Upload back of document (optional)"
                    accept="image/*"
                  />
                  <FileUploadInput
                    id="id-selfie"
                    file={identitySelfie}
                    onChange={setIdentitySelfie}
                    label="Upload selfie (optional)"
                    accept="image/*"
                  />
                  <button
                    type="submit"
                    disabled={identitySubmitting}
                    className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {identitySubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                    {identitySubmitting ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </form>
              )}
            </div>

            {/* Verification Progress */}
            <div className="bg-white rounded-2xl shadow-card p-6">
              {allPersonalComplete ? (
                <div className="text-center space-y-4">
                  <VerifiedSellerBadge />
                  <p className="text-sm font-medium text-green-600">Verified Seller Badge Active!</p>
                </div>
              ) : (
                <VerificationProgress progress={{
                  phone_verified: phoneStatus === 'approved',
                  email_verified: emailVerifStatus === 'approved',
                  identity_verified: identityStatus === 'approved',
                  completed: completedCount,
                  total: 3,
                  is_full_verified_seller: allPersonalComplete,
                }} />
              )}
            </div>
          </div>

          {/* ───── SECTION 2: BUSINESS VERIFICATION ───── */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2.5 bg-amber-100 rounded-xl">
                  <Building2 className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Business Verification</h2>
                  <p className="text-sm text-gray-500">Get your business verified to build trust with customers</p>
                </div>
              </div>
            </div>

            {!allPersonalComplete ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Personal Verification Required</h3>
                    <p className="text-sm text-gray-500">
                      Complete personal verification first to unlock business verification. You have completed {completedCount} of 3 steps.
                    </p>
                  </div>
                </div>
              </div>
            ) : bizError ? (
              <ErrorCard message="Failed to load business verification" onRetry={fetchBusinessVerification} />
            ) : bizStatus === 'approved' ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <BusinessVerifiedBadge />
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl">
                    <CheckCircle className="w-4 h-4" />
                    <span className="font-medium">Verified Business</span>
                  </div>
                  {businessVerification?.business_name && (
                    <p className="text-sm text-gray-500">{businessVerification.business_name}</p>
                  )}
                  {businessVerification?.cac_number && (
                    <p className="text-xs text-gray-400">CAC: {businessVerification.cac_number}</p>
                  )}
                </div>
              </div>
            ) : bizStatus === 'pending' ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-amber-100 rounded-full">
                    <Clock className="w-8 h-8 text-amber-600" />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-xl">
                    <Clock className="w-4 h-4" />
                    Under Review
                  </div>
                  <p className="text-sm text-gray-500">Your business verification is being reviewed. This typically takes 1-3 business days.</p>
                </div>
              </div>
            ) : bizStatus === 'rejected' ? (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="p-3 bg-red-100 rounded-full">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-red-600 bg-red-50 px-4 py-2 rounded-xl">
                    <XCircle className="w-4 h-4" />
                    Rejected{bizRejected ? `: ${bizRejected}` : ''}
                  </div>
                  <p className="text-sm text-gray-500">Please review the rejection reason and resubmit with correct documents.</p>
                  <button
                    onClick={() => setBusinessVerification({ status: null })}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Resubmit
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-card p-6">
                <form onSubmit={handleBusinessSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Business Name</label>
                    <input
                      type="text"
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      placeholder="Enter your business name"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">CAC Registration Number</label>
                    <input
                      type="text"
                      value={cacNumber}
                      onChange={(e) => setCacNumber(e.target.value)}
                      placeholder="e.g. RC-123456"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <FileUploadInput
                    id="cac-doc"
                    file={cacDoc}
                    onChange={setCacDoc}
                    label="Upload CAC Certificate (required)"
                  />
                  <FileUploadInput
                    id="address-doc"
                    file={addressDoc}
                    onChange={setAddressDoc}
                    label="Upload Address Proof (optional)"
                  />
                  <FileUploadInput
                    id="utility-doc"
                    file={utilityDoc}
                    onChange={setUtilityDoc}
                    label="Upload Utility Bill (optional)"
                  />
                  <FileUploadInput
                    id="tax-doc"
                    file={taxDoc}
                    onChange={setTaxDoc}
                    label="Upload Tax Registration (optional)"
                  />
                  <button
                    type="submit"
                    disabled={bizSubmitting}
                    className="w-full px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {bizSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Building2 className="w-4 h-4" />
                    )}
                    {bizSubmitting ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
