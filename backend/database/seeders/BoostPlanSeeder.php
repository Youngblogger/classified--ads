<?php

namespace Database\Seeders;

use App\Models\BoostPlan;
use Illuminate\Database\Seeder;

class BoostPlanSeeder extends Seeder
{
    public function run(): void
    {
        foreach (BoostPlan::getDefaultPlans() as $plan) {
            BoostPlan::updateOrCreate(
                ['type' => $plan['type']],
                $plan
            );
        }
    }
}
