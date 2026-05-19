<?php

namespace App\Services;

use App\Models\Ad;
use App\Models\Category;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class HybridCategorizationService
{
    private array $rulePatterns = [
        'phones' => ['phone', 'iphone', 'samsung', 'android', 'mobile', 'smartphone', 'tecno', 'infinix', 'oppo', 'vivo', 'redmi', 'xiaomi'],
        'laptops' => ['laptop', 'computer', 'macbook', 'dell', 'hp', 'lenovo', 'asus', 'acer', 'notebook'],
        'cars' => ['car', 'vehicle', 'toyota', 'honda', 'ford', 'benz', 'bmw', 'audi', 'chevrolet', 'hyundai'],
        'electronics' => ['tv', 'television', 'speaker', 'headphone', 'airpod', 'charger', 'cable', 'power bank'],
        'furniture' => ['sofa', 'chair', 'table', 'bed', 'wardrobe', 'cabinet', 'dresser', 'shelf'],
        'clothing' => ['shirt', 'dress', 'shoe', 'pants', 'jacket', 'gown', 'agbada', 'wrapper'],
        'jobs' => ['job', 'vacancy', 'career', 'employment', 'hiring', 'recruitment'],
        'real_estate' => ['house', 'apartment', 'flat', 'rent', 'lease', 'property', 'land', 'building'],
    ];

    public function process(Ad $ad): void
    {
        $result = $this->processWithFallback($ad);
        
        if ($result) {
            $ad->update([
                'ai_category_id' => $result['ai_category_id'],
                'ai_confidence' => $result['ai_confidence'],
                'tags' => $result['tags'] ?? [],
                'ai_summary' => $result['ai_summary'] ?? null,
                'is_auto_categorized' => $result['is_auto_categorized'] ?? false,
            ]);
        }
    }

    public function processWithFallback(Ad $ad): ?array
    {
        $text = strtolower($ad->title . ' ' . $ad->description);
        
        $ruleResult = $this->detectByRules($text);
        
        if ($ruleResult) {
            if ($ruleResult['confidence'] >= 80) {
                return [
                    'ai_category_id' => $ruleResult['category_id'],
                    'ai_confidence' => $ruleResult['confidence'],
                    'tags' => $this->generateTags($text),
                    'ai_summary' => $this->generateSummary($ad->description),
                    'is_auto_categorized' => true,
                ];
            }
            
            $this->generateTagsAndSummary($ad);
            return [
                'ai_category_id' => $ruleResult['category_id'],
                'ai_confidence' => $ruleResult['confidence'],
                'tags' => $ad->tags ?? [],
                'ai_summary' => $ad->ai_summary ?? null,
                'is_auto_categorized' => true,
            ];
        }

        try {
            $aiResult = $this->detectWithAI($ad);
            
            if ($aiResult) {
                return [
                    'ai_category_id' => $aiResult['category_id'],
                    'ai_confidence' => $aiResult['confidence'],
                    'tags' => $aiResult['tags'] ?? [],
                    'ai_summary' => $aiResult['summary'] ?? null,
                    'is_auto_categorized' => true,
                ];
            }
        } catch (\Exception $e) {
            Log::error('AI categorization failed: ' . $e->getMessage());
        }

        return [
            'ai_category_id' => $ad->category_id,
            'ai_confidence' => 30,
            'tags' => [],
            'ai_summary' => substr($ad->description, 0, 200),
            'is_auto_categorized' => false,
        ];
    }

    private function generateTags(string $text): array
    {
        $words = preg_split('/\s+/', $text);
        
        $tags = array_filter($words, function($word) {
            return strlen($word) >= 3 && !in_array($word, ['the', 'and', 'for', 'with', 'this', 'that', 'from', 'item', 'condition']);
        });
        
        return array_values(array_unique(array_slice($tags, 0, 10)));
    }

    private function generateSummary(string $description): string
    {
        $summary = substr($description, 0, 200);
        if (strlen($description) > 200) {
            $summary .= '...';
        }
        return $summary;
    }

    private function detectByRules(string $text): ?array
    {
        foreach ($this->rulePatterns as $categoryType => $patterns) {
            foreach ($patterns as $pattern) {
                if (strpos($text, $pattern) !== false) {
                    $category = $this->getCategoryForType($categoryType);
                    if ($category) {
                        return [
                            'category_id' => $category->id,
                            'confidence' => 85.00,
                        ];
                    }
                }
            }
        }
        return null;
    }

    private function getCategoryForType(string $type): ?Category
    {
        $categoryMap = [
            'phones' => 'mobile-phones',
            'laptops' => 'computers',
            'cars' => 'vehicles',
            'electronics' => 'electronics',
            'furniture' => 'furniture',
            'clothing' => 'fashion',
            'jobs' => 'jobs',
            'real_estate' => 'real-estate',
        ];
        
        $slug = $categoryMap[$type] ?? null;
        
        if ($slug) {
            return Category::where('slug', $slug)->first();
        }
        
        return null;
    }

    private function detectWithAI(Ad $ad): ?array
    {
        $apiKey = config('services.openai.key');
        $apiUrl = config('services.openai.url') . '/chat/completions';
        
        if (!$apiKey) {
            Log::warning('OpenAI key not configured, skipping AI categorization');
            return null;
        }

        $prompt = $this->buildCategorizationPrompt($ad);

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($apiUrl, [
                'model' => 'gpt-3.5-turbo',
                'messages' => [
                    ['role' => 'system', 'content' => 'You are a classified ads categorization expert. Analyze ad content and return JSON with category_id (match from available categories), confidence (0-100), tags (array of relevant keywords), and summary (brief 1-2 sentence description).'],
                    ['role' => 'user', 'content' => $prompt]
                ],
                'temperature' => 0.3,
            ]);

            if ($response->successful()) {
                $content = $response->json('choices.0.message.content');
                $result = json_decode($content, true);
                
                if ($result && isset($result['category_id'])) {
                    return $result;
                }
            }
        } catch (\Exception $e) {
            Log::error('AI categorization failed: ' . $e->getMessage());
        }

        return null;
    }

    private function buildCategorizationPrompt(Ad $ad): string
    {
        $categories = Category::whereNull('parent_id')->orWhere('parent_id', '!=', null)
            ->select('id', 'name', 'slug')
            ->limit(50)
            ->get()
            ->toJson();

        return "Analyze this classified ad and determine the best category.
        
Title: {$ad->title}
Description: {$ad->description}
Price: {$ad->price} {$ad->currency}
Condition: {$ad->condition}

Available categories (use the id field): {$categories}

Return JSON with:
- category_id: The matching category ID
- confidence: Your confidence level (0-100)
- tags: Array of relevant keywords/tags
- summary: A brief 1-2 sentence description of the item";
    }

    private function generateTagsAndSummary(Ad $ad): void
    {
        $text = $ad->title . ' ' . $ad->description;
        $words = preg_split('/\s+/', strtolower($text));
        
        $tags = array_filter($words, function($word) {
            return strlen($word) >= 3 && !in_array($word, ['the', 'and', 'for', 'with', 'this', 'that', 'from']);
        });
        
        $tags = array_values(array_unique(array_slice($tags, 0, 10)));
        
        $summary = substr($ad->description, 0, 200);
        if (strlen($ad->description) > 200) {
            $summary .= '...';
        }

        $ad->update([
            'tags' => $tags,
            'ai_summary' => $summary,
        ]);
    }
}
