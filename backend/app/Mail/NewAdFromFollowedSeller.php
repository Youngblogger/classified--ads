<?php

namespace App\Mail;

use App\Models\Ad;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class NewAdFromFollowedSeller extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public User $follower;
    public Ad $ad;
    public string $adUrl;

    public function __construct(User $follower, Ad $ad)
    {
        $this->follower = $follower;
        $this->ad = $ad;
        $this->adUrl = config('app.url') . '/ad/' . $ad->slug;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: '🆕 ' . $this->ad->user->name . ' just posted: ' . $this->ad->title,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.new-ad-followed',
            with: [
                'followerName' => $this->follower->name,
                'sellerName' => $this->ad->user->name,
                'adTitle' => $this->ad->title,
                'adPrice' => '₦' . number_format($this->ad->price, 0, '.', ','),
                'adUrl' => $this->adUrl,
                'adImage' => $this->ad->images->first()?->url 
                    ? config('app.url') . '/storage/' . $this->ad->images->first()->url 
                    : null,
                'appName' => config('app.name', 'iList'),
                'appUrl' => config('app.url'),
            ],
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
