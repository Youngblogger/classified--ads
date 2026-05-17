<?php

namespace App\Console\Commands;

use App\Services\PendingPaymentExpiryService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class CleanupExpiredPayments extends Command
{
    protected $signature = 'payments:cleanup-expired
                            {--dry-run : Simulate without making changes}';

    protected $description = 'Auto-expire pending payments that have exceeded the time limit with Paystack verification';

    public function handle(PendingPaymentExpiryService $expiryService): int
    {
        if ($this->option('dry-run')) {
            $cutoff = now()->subMinutes($expiryService->getExpiryMinutes());
            $pendingIntents = \App\Models\PaymentIntent::where('status', 'pending')
                ->where('created_at', '<=', $cutoff)
                ->count();
            $pendingTransactions = \App\Models\Transaction::where('status', 'pending')
                ->where('type', 'credit')
                ->where('payment_method', 'paystack')
                ->where('created_at', '<=', $cutoff)
                ->count();

            $this->info("[DRY RUN] Would process {$pendingIntents} expired payment intents and {$pendingTransactions} expired wallet transactions");
            return Command::SUCCESS;
        }

        $expiredIntents = $expiryService->verifyAndExpirePendingPaymentIntents();
        $expiredTransactions = $expiryService->verifyAndExpirePendingTransactions();
        $total = $expiredIntents + $expiredTransactions;

        Log::info('Expired payments cleanup completed', [
            'expired_payment_intents' => $expiredIntents,
            'expired_wallet_transactions' => $expiredTransactions,
            'total' => $total,
        ]);

        $this->info("Cleaned up {$expiredIntents} expired payment intents and {$expiredTransactions} expired wallet transactions.");

        return Command::SUCCESS;
    }
}
