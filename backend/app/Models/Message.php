<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'content',
        'read_at',
        'is_system',
        'attachment_url',
        'message_type',
        'duration',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'is_system' => 'boolean',
        'duration' => 'integer',
    ];

    protected $hidden = [
        'conversation',
    ];

    protected $appends = ['audio_url'];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class);
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function markAsRead(): void
    {
        if (!$this->read_at) {
            $this->update(['read_at' => now()]);
        }
    }

    public function scopeUnread($query)
    {
        return $query->whereNull('read_at');
    }

    public function getAudioUrlAttribute(): ?string
    {
        // Return audio_url as alias for attachment_url for voice messages
        if ($this->message_type === 'voice' && $this->attachment_url) {
            return $this->attachment_url;
        }
        return null;
    }
}
