<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class WalletFundedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public float $amount,
        public string $method
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Wallet Funded Successfully')
            ->line('Your wallet has been funded successfully.')
            ->line('Amount: ₦' . number_format($this->amount, 2))
            ->line('Method: ' . $this->method)
            ->line('Thank you for using iList.ng!');
    }

    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'wallet_funded',
            'amount' => $this->amount,
            'method' => $this->method,
            'message' => 'Your wallet has been funded with ₦' . number_format($this->amount, 2) . ' via ' . $this->method,
        ];
    }
}
