import { createHash, randomBytes, createCipheriv, createDecipheriv } from 'crypto';
import { supabase } from './supabase';

const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ID_ENCRYPTION_KEY || randomBytes(32).toString('hex');

function getKey(): Buffer {
  const key = Buffer.from(ENCRYPTION_KEY, 'hex');
  if (key.length !== 32) {
    return randomBytes(32);
  }
  return key;
}

export function encryptDocument(text: string): string {
  const key = getKey();
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptDocument(encryptedText: string): string | null {
  try {
    const key = getKey();
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return null;
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return null;
  }
}

export function hashDocumentNumber(docNumber: string): string {
  return createHash('sha256').update(docNumber).digest('hex');
}

export function maskDocumentNumber(docNumber: string, visibleChars: number = 4): string {
  if (docNumber.length <= visibleChars) return docNumber;
  const masked = '*'.repeat(docNumber.length - visibleChars);
  return masked + docNumber.slice(-visibleChars);
}

export async function createAuditLog(params: {
  userId?: string;
  action: string;
  entityType: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  await supabase.from('audit_logs').insert({
    user_id: params.userId,
    action: params.action,
    entity_type: params.entityType,
    entity_id: params.entityId,
    old_values: params.oldValues ?? null,
    new_values: params.newValues ?? null,
    ip_address: params.ipAddress ?? null,
    user_agent: params.userAgent ?? null,
  });
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests: number = 5, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= maxRequests) {
    return false;
  }

  entry.count++;
  return true;
}
