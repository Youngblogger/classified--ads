<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE ads MODIFY COLUMN status ENUM('pending', 'active', 'sold', 'expired', 'rejected', 'draft') DEFAULT 'pending'");
    }

    public function down(): void
    {
        DB::statement("UPDATE ads SET status = 'rejected' WHERE status = 'draft'");
        DB::statement("ALTER TABLE ads MODIFY COLUMN status ENUM('pending', 'active', 'sold', 'expired', 'rejected') DEFAULT 'pending'");
    }
};
