<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategoryMegaMenuSeeder extends Seeder
{
    public function run(): void
    {
        $updates = [
            'vehicles' => ['is_featured' => true, 'is_trending' => true],
            'mobile-phones' => ['is_featured' => true, 'is_trending' => true, 'category_badge' => 'trending'],
            'electronics' => ['is_featured' => true],
            'property' => ['is_featured' => true, 'category_badge' => 'popular'],
            'fashion' => ['is_trending' => true],
            'jobs' => ['category_badge' => 'new'],
            'cars' => ['is_featured' => true, 'is_trending' => true],
            'smartphones' => ['is_featured' => true, 'is_trending' => true],
            'laptops' => ['is_featured' => true],
            'apartments-rent' => ['is_trending' => true],
            'houses-sale' => ['is_featured' => true],
            'tvs' => ['is_trending' => true],
            'gaming-consoles' => ['category_badge' => 'trending'],
            'dogs' => ['is_trending' => true],
            'tech-jobs' => ['category_badge' => 'new'],
            'remote-jobs' => ['is_trending' => true],
            'gym-equipment' => ['category_badge' => 'popular'],
            'furniture' => ['is_featured' => true],
            'skincare' => ['is_trending' => true],
            'baby-clothing' => ['category_badge' => 'new'],
            'toyota' => ['is_featured' => true],
            'mercedes-benz' => ['is_trending' => true, 'category_badge' => 'popular'],
        ];

        foreach ($updates as $slug => $data) {
            Category::where('slug', $slug)->update($data);
        }

        $levels = [
            'vehicles' => 0, 'mobile-phones' => 0, 'electronics' => 0, 'baby-kids' => 0,
            'fashion' => 0, 'home-furniture' => 0, 'health-beauty' => 0, 'jobs' => 0,
            'pets' => 0, 'property' => 0, 'services' => 0, 'sports' => 0,
        ];

        foreach ($levels as $slug => $level) {
            Category::where('slug', $slug)->update(['level' => $level]);
        }

        Category::whereNotNull('parent_id')->whereNull('level')->orWhere('level', 0)
            ->chunk(100, function ($cats) {
                foreach ($cats as $cat) {
                    $level = 1;
                    $parent = $cat->parent;
                    while ($parent) {
                        $level++;
                        $parent = $parent->parent;
                    }
                    if ($level > 8) $level = 8;
                    Category::where('id', $cat->id)->update(['level' => $level]);
                }
            });

        $this->command->info('Mega menu data seeded successfully!');
    }
}
