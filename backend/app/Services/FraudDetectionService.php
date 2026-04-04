<?php

namespace App\Services;

use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class FraudDetectionService
{
    const MIN_AMOUNT = 100;
    const MAX_AMOUNT = 10000000;
    const SUSPICIOUS_LOW_AMOUNT = 50;
    const SUSPICIOUS_HIGH_AMOUNT = 5000000;
    const RAPID_SUBMISSION_THRESHOLD_MINUTES = 60;
    const RAPID_SUBMISSION_COUNT = 3;

    public function analyze(array $data): array
    {
        $flags = [];
        $isSuspicious = false;

        // Check 1: Amount anomalies
        $amountFlags = $this->checkAmountAnomaly($data['amount'] ?? 0);
        if ($amountFlags) {
            $flags = array_merge($flags, $amountFlags);
            $isSuspicious = true;
        }

        // Check 2: Duplicate reference
        $refFlags = $this->checkDuplicateReference($data['reference'] ?? '');
        if ($refFlags) {
            $flags = array_merge($flags, $refFlags);
            $isSuspicious = true;
        }

        // Check 3: Duplicate image (if proof provided)
        if (!empty($data['proof_hash'])) {
            $imgFlags = $this->checkDuplicateImage($data['proof_hash']);
            if ($imgFlags) {
                $flags = array_merge($flags, $imgFlags);
                $isSuspicious = true;
            }
        }
function name(){
    if (!empty($data['proof_hash'])) {
        $imgFlags = $this->checkDuplicateImage($data['proof_hash']);
        if ($imgFlags) {
            $flags = array_merge($flags, $imgFlags);
            $isSuspicious = true;
        }
}
        // Check 4: Rapid submissions
        $rapidFlags = $this->checkRapidSubmissions($data['user_id'] ?? null);
        if ($rapidFlags) {
            $flags = array_merge($flags, $rapidFlags);
            $isSuspicious = true;
        }

        // Check 5: Suspicious filename patterns
        if (!empty($data['filename'])) {
            $filenameFlags = $this->checkSuspiciousFilename($data['filename']);
            if ($filenameFlags) {
                $flags = array_merge($flags, $filenameFlags);
            }
        }

        Log::info('Fraud detection analysis', [
            'user_id' => $data['user_id'] ?? null,
            'amount' => $data['amount'] ?? 0,
            'is_suspicious' => $isSuspicious,
            'flags' => $flags,
        ]);

        return [
            'is_suspicious' => $isSuspicious,
            'flags' => $flags,
            'risk_level' => $this->calculateRiskLevel($flags),
        ];
    }

    protected function checkAmountAnomaly(float $amount): array
    {
        $flags = [];

        if ($amount < self::SUSPICIOUS_LOW_AMOUNT) {
            $flags[] = 'extremely_low_amount';
        }

        if ($amount > self::SUSPICIOUS_HIGH_AMOUNT) {
            $flags[] = 'extremely_high_amount';
        }
        return $flags;
    }

    protected function checkDuplicateReference(string $reference): array
    {
        if (empty($reference)) {
            return [];
        }

        $exists = Transaction::where('reference', $reference)
            ->whereIn('status', ['pending', 'success'])
            ->exists();

        if ($exists) {
            return ['duplicate_reference'];
        }

        return [];
    }

    protected function checkDuplicateImage(string $proofHash): array
    {
        if (empty($proofHash)) {
            return [];
        }

        $exists = Transaction::whereJsonContains('metadata->proof_hash', $proofHash)
            ->whereIn('status', ['pending', 'success'])
            ->exists();

        if ($exists) {
            return ['duplicate_image'];
        }

        return [];
    }

    protected function checkRapidSubmissions(?int $userId): array
    {
        if (!$userId) {
            return [];
        }

        $cutoff = now()->subMinutes(self::RAPID_SUBMISSION_THRESHOLD_MINUTES);

        $count = Transaction::where('user_id', $userId)
            ->where('payment_method', 'bank_transfer')
            ->where('status', 'pending')
            ->where('created_at', '>=', $cutoff)
            ->count();

        if ($count >= self::RAPID_SUBMISSION_COUNT) {
            return ['rapid_submissions'];
        }

        return [];
    }

    protected function checkSuspiciousFilename(string $filename): array
    {
        $flags = [];

        // Check for generic/suspicious patterns
        $suspiciousPatterns = [
            '/^screenshot_?\d+$/i',
            '/^img_?\d+$/i',
            '/^photo_?\d+$/i',
            '/^image_?\d+$/i',
            '/^screen_?shot$/i',
            '/^receipt\.pdf$/i',
            '/^untitled\.png$/i',
        ];

        foreach ($suspiciousPatterns as $pattern) {
            if (preg_match($pattern, $filename)) {
                $flags[] = 'suspicious_filename';
                break;
            }
        }

        return $flags;
    }

    protected function calculateRiskLevel(array $flags): string
    {
        if (empty($flags)) {
            return 'low';
        }

        $highRiskFlags = ['duplicate_reference', 'duplicate_image', 'rapid_submissions'];
        $highRiskCount = array_intersect($flags, $highRiskFlags);

        if (count($highRiskCount) >= 2) {
            return 'high';
        }

        if (count($highRiskCount) >= 1) {
            return 'medium';
        }

        return 'low';
    }

    public function getImageHash($file): ?string
    {
        if (!$file || !$file->isValid()) {
            return null;
        }

        // Get file content and create hash
        $content = file_get_contents($file->getRealPath());
        return hash('sha256', $content);
    }
}
