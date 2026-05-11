<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE ads MODIFY COLUMN status ENUM('pending', 'active', 'paused', 'sold', 'expired', 'rejected', 'draft', 'suspended') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("UPDATE ads SET status = 'active' WHERE status IN ('paused', 'suspended')");
        DB::statement("ALTER TABLE ads MODIFY COLUMN status ENUM('pending', 'active', 'sold', 'expired', 'rejected', 'draft') DEFAULT 'pending'");
    }
};
