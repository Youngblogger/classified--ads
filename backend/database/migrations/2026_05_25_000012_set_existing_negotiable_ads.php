<?php

use App\Models\Ad;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('ads', 'negotiable')) {
            Ad::where('negotiable', false)
                ->where(function ($q) {
                    $q->where('description', 'like', '%negotiable%')
                      ->orWhere('title', 'like', '%negotiable%');
                })
                ->update(['negotiable' => true]);
        }
    }

    public function down(): void
    {
        // No rollback - data change
    }
};
