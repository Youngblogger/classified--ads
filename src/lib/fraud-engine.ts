'use server';

import { supabase } from './supabase';

export interface FraudInput {
  deviceId?: string;
  ipAddress?: string;
  userId: string;
  documentNumber?: string;
  documentHash?: string;
  failedKycAttempts?: number;
}

export interface FraudResult {
  score: number;
  signals: FraudSignal[];
  decision: 'approve' | 'manual_review' | 'reject';
}

export interface FraudSignal {
  type: string;
  label: string;
  weight: number;
}

export async function analyzeFraud(input: FraudInput): Promise<FraudResult> {
  let score = 0;
  const signals: FraudSignal[] = [];

  const deviceReuse = await checkDeviceReuse(input.deviceId, input.userId);
  if (deviceReuse) {
    score += 30;
    signals.push({ type: 'device_reuse', label: 'Multiple accounts from same device', weight: 30 });
  }

  const docReuse = await checkDocumentReuse(input.documentHash, input.userId);
  if (docReuse) {
    score += 40;
    signals.push({ type: 'document_similarity_match', label: 'Identity document reused across accounts', weight: 40 });
  }

  const ipMismatch = await checkIpMismatch(input.ipAddress, input.userId);
  if (ipMismatch) {
    score += 20;
    signals.push({ type: 'ip_mismatch', label: 'Suspicious IP/location mismatch', weight: 20 });
  }

  if ((input.failedKycAttempts ?? 0) > 3) {
    score += 25;
    signals.push({ type: 'failed_attempts', label: 'Repeated failed KYC attempts', weight: 25 });
  }

  score = Math.min(score, 100);

  let decision: FraudResult['decision'];
  if (score > 70) {
    decision = 'reject';
  } else if (score >= 40) {
    decision = 'manual_review';
  } else {
    decision = 'approve';
  }

  await logFraudSignals(input.userId, signals, score);

  return { score, signals, decision };
}

async function checkDeviceReuse(deviceId?: string, userId?: string): Promise<boolean> {
  if (!deviceId) return false;
  const { data, error } = await supabase
    .from('fraud_signals')
    .select('user_id')
    .eq('signal_type', 'device_id')
    .eq('signal_value', deviceId)
    .neq('user_id', userId)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

async function checkDocumentReuse(documentHash?: string, userId?: string): Promise<boolean> {
  if (!documentHash) return false;
  const { data, error } = await supabase
    .from('fraud_signals')
    .select('user_id')
    .eq('signal_type', 'document_hash')
    .eq('signal_value', documentHash)
    .neq('user_id', userId)
    .limit(1);
  if (error) return false;
  return (data?.length ?? 0) > 0;
}

async function checkIpMismatch(ipAddress?: string, userId?: string): Promise<boolean> {
  if (!ipAddress || !userId) return false;
  const { data, error } = await supabase
    .from('fraud_signals')
    .select('signal_value')
    .eq('user_id', userId)
    .eq('signal_type', 'ip_address')
    .order('created_at', { ascending: false })
    .limit(1);
  if (error || !data || data.length === 0) return false;
  return data[0].signal_value !== ipAddress;
}

async function logFraudSignals(userId: string, signals: FraudSignal[], score: number): Promise<void> {
  const records = signals.map(s => ({
    user_id: userId,
    signal_type: s.type,
    signal_value: s.label,
    score: s.weight,
    metadata: { total_score: score },
  }));
  await supabase.from('fraud_signals').insert(records);
}

export function calculateFraudScore(input: {
  device_reuse?: boolean;
  ip_mismatch?: boolean;
  document_similarity_match?: boolean;
  failed_attempts?: number;
}): number {
  let score = 0;
  if (input.device_reuse) score += 30;
  if (input.ip_mismatch) score += 20;
  if (input.document_similarity_match) score += 40;
  if ((input.failed_attempts ?? 0) > 3) score += 25;
  return Math.min(score, 100);
}
