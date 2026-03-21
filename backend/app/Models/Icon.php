<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Icon extends Model
{
    protected $fillable = ['name', 'category', 'path', 'type', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public static function getAllIcons(): array
    {
        return [
            'car', 'truck', 'bus', 'bike', 'motorcycle', 'train', 'plane', 'ship',
            'home', 'building', 'apartment', 'land', 'warehouse', 'door',
            'smartphone', 'laptop', 'tablet', 'monitor', 'tv', 'camera', 'headphones', 'speaker', 'watch', 'wifi',
            'sofa', 'bed', 'chair', 'table', 'lamp', 'wardrobe', 'couch', 'armchair',
            'shirt', 'dress', 'hat', 'shoe', 'bag', 'ring', 'necklace', 'tie', 'scarf', 'backpack', 'briefcase',
            'briefcase', 'user', 'users', 'graduation-cap', 'book', 'pencil', 'mail', 'phone', 'calendar', 'clock',
            'tool', 'wrench', 'hammer', 'paint', 'scissors', 'stethoscope', 'pill', 'heart', 'baby',
            'dog', 'cat', 'fish', 'bird', 'rabbit', 'paw-print', 'bone',
            'dumbbell', 'trophy', 'medal', 'football', 'basketball', 'running', 'swimmer', 'ski', 'mountain',
            'heart-pulse', 'activity', 'brain', 'muscle', 'apple', 'carrot', 'droplet', 'bed', 'bath',
            'dollar', 'credit-card', 'wallet', 'chart', 'trending-up', 'trending-down', 'pie-chart', 'bar-chart',
            'utensils', 'coffee', 'beer', 'wine', 'pizza', 'burger', 'cookie', 'cake', 'ice-cream', 'chef-hat',
            'palette', 'brush', 'image', 'video', 'music', 'disc', 'mic', 'guitars', 'film',
            'cpu', 'database', 'server', 'hard-drive', 'cloud', 'code', 'terminal', 'usb', 'bluetooth',
            'box', 'package', 'gift', 'cart', 'tag', 'tags', 'star', 'flag', 'alert', 'info', 'help',
            'search', 'settings', 'message', 'send', 'bell', 'map-pin', 'link', 'share', 'copy',
            'edit', 'trash', 'plus', 'minus', 'check', 'x', 'menu', 'filter', 'sort', 'eye', 'eye-off',
            'arrow-up', 'arrow-down', 'arrow-left', 'arrow-right', 'chevron-up', 'chevron-down', 'chevron-left',
            'refresh', 'rotate-ccw', 'maximize', 'minimize', 'zoom-in', 'zoom-out', 'play', 'pause', 'volume',
            'lock', 'unlock', 'key', 'shield', 'shield-check', 'zap', 'power', 'target', 'globe', 'map', 'navigation', 'compass',
            'book', 'book-open', 'notebook', 'newspaper', 'file', 'folder', 'folder-open', 'archive', 'download', 'upload',
            'coins', 'banknote', 'money', 'piggy-bank', 'safe', 'shopping-bag', 'shopping-cart', 'basket',
            'at-sign', 'mail-open', 'mail-search', 'mails', 'message-circle', 'megaphone', 'notification',
            'sun', 'sunrise', 'sunset', 'moon', 'cloud', 'cloud-rain', 'cloud-lightning', 'cloud-snow', 'cloud-sun',
            'wind', 'snowflake', 'waves', 'umbrella', 'rainbow', 'thermometer', 'bandage', 'accessibility',
        ];
    }

    public static function getIconCategories(): array
    {
        return [
            'vehicles' => 'Vehicles',
            'property' => 'Property',
            'electronics' => 'Electronics',
            'furniture' => 'Furniture',
            'fashion' => 'Fashion',
            'jobs' => 'Jobs & Services',
            'animals' => 'Animals & Pets',
            'sports' => 'Sports',
            'health' => 'Health & Beauty',
            'business' => 'Business',
            'food' => 'Food & Drinks',
            'art' => 'Art & Music',
            'technology' => 'Technology',
            'general' => 'General',
        ];
    }

    public static function getIconsByCategory(string $category): array
    {
        $categoryIcons = [
            'vehicles' => ['car', 'truck', 'bus', 'bike', 'motorcycle', 'train', 'plane', 'ship', 'ambulance', 'taxi'],
            'property' => ['home', 'building', 'apartment', 'land', 'warehouse', 'door', 'door-open', 'building-2'],
            'electronics' => ['smartphone', 'laptop', 'tablet', 'monitor', 'tv', 'camera', 'headphones', 'speaker', 'watch', 'wifi', 'cpu', 'database', 'server', 'cloud'],
            'furniture' => ['sofa', 'bed', 'chair', 'table', 'lamp', 'wardrobe', 'door', 'shelves', 'couch', 'armchair'],
            'fashion' => ['shirt', 'dress', 'hat', 'shoe', 'bag', 'ring', 'necklace', 'tie', 'scarf', 'gloves', 'umbrella', 'backpack', 'briefcase'],
            'jobs' => ['briefcase', 'user', 'users', 'graduation-cap', 'book', 'pencil', 'ruler', 'clipboard', 'mail', 'phone', 'calendar', 'clock', 'target', 'award', 'star'],
            'animals' => ['dog', 'cat', 'fish', 'bird', 'rabbit', 'paw-print', 'heart-pulse', 'bone', 'fish-symbol'],
            'sports' => ['dumbbell', 'bike', 'running', 'swimmer', 'trophy', 'medal', 'football', 'basketball', 'tennis', 'golf', 'ski', 'mountain', 'trees'],
            'health' => ['heart-pulse', 'stethoscope', 'pill', 'syringe', 'thermometer', 'bandage', 'accessibility', 'brain', 'muscle', 'apple', 'carrot', 'droplet', 'bed', 'bath'],
            'business' => ['building', 'landmark', 'bank', 'dollar', 'credit-card', 'wallet', 'chart', 'trending-up', 'trending-down', 'pie-chart', 'bar-chart', 'briefcase', 'handshake'],
            'food' => ['utensils', 'coffee', 'beer', 'wine', 'pizza', 'burger', 'cookie', 'cake', 'ice-cream', 'chef-hat', 'cooking-pot', 'shopping-cart', 'store', 'cup-soda', 'glass-water'],
            'art' => ['palette', 'brush', 'pencil', 'image', 'video', 'music', 'disc', 'speaker', 'headphones', 'mic', 'guitars', 'camera', 'film', 'paint'],
            'technology' => ['cpu', 'database', 'server', 'hard-drive', 'smartphone', 'laptop', 'monitor', 'projector', 'wifi', 'bluetooth', 'usb', 'code', 'terminal', 'cloud', 'cloud-upload', 'cloud-download'],
            'general' => ['tag', 'tags', 'star', 'heart', 'flag', 'alert', 'info', 'help', 'search', 'settings', 'lock', 'unlock', 'key', 'shield', 'zap', 'power', 'map', 'globe', 'navigation', 'compass'],
        ];

        return $categoryIcons[$category] ?? self::getAllIcons();
    }

    public function getUrlAttribute(): ?string
    {
        if ($this->type === 'custom' && $this->path) {
            return url('storage/' . $this->path);
        }
        return null;
    }

    public function scopeLibrary($query)
    {
        return $query->where('type', 'library');
    }

    public function scopeCustom($query)
    {
        return $query->where('type', 'custom');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSearch($query, string $term)
    {
        return $query->where('name', 'like', '%' . $term . '%');
    }
}
