# iList Production Roadmap

## Phase 1: Core Infrastructure (Week 1-2)

### 1.1 Queue & Background Jobs
```bash
# Install Supervisor (Linux) or use Windows Task Scheduler
# For production, use Laravel Horizon

composer require laravel/horizon

php artisan horizon:install
php artisan horizon:publish
```

**Config:** `config/horizon.php`
- Environment: production
- Queue: default (database)
- MaxProcesses: 10
- Balance: auto

**Supervisor config (Linux):**
```ini
[program:ilist-worker]
process_name=%(program_name)s
command=php artisan horizon
autostart=true
autorestart=true
stopasgroup=true
killasgroup=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/ilist-worker.log
stopwaitsecs=3600
```

### 1.2 Database Optimization
```php
// Add indexes for search performance
Schema::table('ads', function (Blueprint $table) {
    $table->index('processing_status');
    $table->index('verification_status');
    $table->index(['category_id', 'processing_status']);
    $table->index(['status', 'processing_status']);
    $table->index('ai_confidence');
    $table->fullText(['title', 'description', 'tags']);
});
```

### 1.3 Caching Layer
```php
// config/cache.php - Configure Redis
'redis' => [
    'client' => env('REDIS_CLIENT', 'phpredis'),
    'default' => [
        'host' => env('REDIS_HOST', '127.0.0.1'),
        'password' => env('REDIS_PASSWORD'),
        'port' => env('REDIS_PORT', 6379),
        'database' => env('REDIS_CACHE_DB', 2),
    ],
],
```

**Cache search results:**
```php
// In SearchService
$cacheKey = 'search:' . md5(json_encode($params));
$results = Cache::remember($cacheKey, 300, function() use ($params) {
    return $this->search($params);
});
```

---

## Phase 2: API Security (Week 2)

### 2.1 Rate Limiting
```php
// app/Http/Middleware/ThrottleRequests.php
// Or configure in RouteServiceProvider

Route::middleware(['api', 'throttle:60,1'])->group(function () {
    // Search endpoints
});

Route::middleware(['api', 'throttle:10,1'])->group(function () {
    // Create ad endpoint
});
```

### 2.2 API Authentication
```php
// config/sanctum.php
'abilities' => [
    'search',
    'create-ad',
    'manage-ads',
],
// Use Laravel Sanctum for token-based auth
```

### 2.3 Input Validation & Sanitization
```php
// In AdController store method
$data = $request->validate([
    'title' => 'required|string|max:255|min:10',
    'description' => 'required|string|min:20|max:5000',
    'price' => 'required|numeric|min:1',
    // Add XSS protection
]);
// Use HTMLPurifier for description field
```

---

## Phase 3: Performance (Week 3)

### 3.1 Query Optimization
```php
// Use with() for eager loading
// Select only needed columns
// Implement cursor() for large datasets
Ad::with(['images:id,ad_id,url', 'category:id,name,slug'])
    ->select('id', 'title', 'price', 'category_id')
    ->where('status', 'active')
    ->cursor();
```

### 3.2 Image Optimization
- Use WebP format (already implemented in ImageProcessingService)
- CDN for image delivery
- Lazy loading
- Image compression queue

### 3.3 Database Connections
```php
// config/database.php
'connections' => [
    'mysql' => [
        'pooling' => true,
        'sticky' => true,
        'cache' => true,
    ],
],
```

---

## Phase 4: Monitoring & Logging (Week 3-4)

### 4.1 Laravel Telescope (Dev) / Scout (Prod)
```bash
composer require laravel/telescope
php artisan telescope:install
php artisan migrate
```

### 4.2 Error Tracking
```bash
# Install Sentry
composer require sentry/sentry-laravel

# config/sentry.php
'spotlight' => env('SPOTLIGHT_ENABLED', false),
```

### 4.3 Health Checks
```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'healthy',
        'queue' => DB::table('jobs')->count(),
        'database' => DB::connection()->getPdo(),
    ]);
});
```

---

## Phase 5: AI Pipeline Optimization (Week 4)

### 5.1 Batch Processing
```php
// Process multiple ads in one AI call
class BatchCategorizationService
{
    public function processBatch(array $adIds): void
    {
        $ads = Ad::whereIn('id', $adIds)->get();
        
        // Build batch prompt
        $prompt = $this->buildBatchPrompt($ads);
        
        // Single AI call
        $results = $this->callAI($prompt);
        
        // Update all ads
        foreach ($results as $result) {
            Ad::find($result['ad_id'])->update($result);
        }
    }
}
```

### 5.2 Cost Optimization
```php
// Skip AI for high-confidence rule matches
if ($ruleResult['confidence'] >= 80) {
    return $ruleResult; // Skip AI
}
```

### 5.3 Retry Logic with Exponential Backoff
```php
// In HybridCategorizationService
$maxRetries = 3;
$delay = 1000; // 1 second

for ($i = 0; $i < $maxRetries; $i++) {
    try {
        return $this->callAI($prompt);
    } catch (\Exception $e) {
        if ($i === $maxRetries - 1) throw;
        usleep($delay * 1000);
        $delay *= 2; // Exponential backoff
    }
}
```

---

## Phase 6: Testing (Week 5)

### 6.1 Feature Tests
```php
// tests/Feature/SearchTest.php
public function test_search_returns_relevant_results()
{
    $ad = Ad::factory()->create([
        'title' => 'iPhone 14 Pro',
        'processing_status' => 'completed',
    ]);

    $response = $this->getJson('/api/search?q=iPhone');

    $response->assertStatus(200)
        ->assertJsonFragment(['ad_id' => $ad->id]);
}

public function test_search_excludes_unprocessed_ads()
{
    Ad::factory()->create(['processing_status' => 'pending']);

    $response = $this->getJson('/api/search');

    $response->assertJsonCount(0, 'data');
}
```

### 6.2 Unit Tests
```php
// tests/Unit/SearchServiceTest.php
public function test_scoring_prioritizes_title_match()
{
    $service = app(SearchService::class);
    
    $result = $service->search(['search_query' => 'test']);
    
    $this->assertGreaterThan(0, $result['results'][0]['relevance_score']);
}
```

### 6.3 Run Tests
```bash
# Run all tests
php artisan test

# With coverage
php artisan test --coverage

# Run specific test
php artisan test --filter=SearchTest
```

---

## Phase 7: Deployment (Week 6)

### 7.1 Environment Setup
```bash
# .env.production
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-domain.com

QUEUE_CONNECTION=redis
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=your-password

CACHE_DRIVER=redis
SESSION_DRIVER=redis

# AI Service
OPENAI_KEY=sk-...

# Rate limiting
RATE_LIMITER=60
```

### 7.2 Deploy Script
```bash
#!/bin/bash
# deploy.sh

echo "Deploying iList..."

# Pull latest code
git pull origin main

# Install dependencies
composer install --optimize-autoloader

# Run migrations
php artisan migrate --force

# Clear and rebuild cache
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart queue worker
php artisan horizon:terminate
php artisan horizon

# Log deployment
echo "Deployed at $(date)" >> deployment.log
```

### 7.3 CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-php@v3
        with:
          php-version: '8.2'
      - run: composer install
      - run: php artisan test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: ./deploy.sh
```

---

## Phase 8: Post-Launch (Ongoing)

### 8.1 Analytics
- Track search queries
- Monitor failed AI categorizations
- Log processing queue backlog

### 8.2 Admin Dashboard
- Real-time queue status
- AI confidence distribution
- Flagged ads queue
- Processing error logs

### 8.3 User Feedback
- Allow users to report miscategorized ads
- Learning system: store corrections
- Improve rule-based patterns

---

## Quick Start Commands

```bash
# Setup queue
composer install
php artisan migrate
php artisan queue:table
php artisan migrate

# Start workers
php artisan horizon

# Process existing ads
php artisan ads:reprocess

# Search test
php artisan tinker --execute="echo json_encode(app(\App\Services\SearchService::class)->search(['search_query' => 'toyota']), JSON_PRETTY_PRINT);"
```

---

## Production Checklist

- [ ] Redis installed and configured
- [ ] Queue worker running (Horizon/Supervisor)
- [ ] Database indexes created
- [ ] Rate limiting enabled
- [ ] API authentication enforced
- [ ] Caching configured
- [ ] Health check endpoint
- [ ] Error tracking (Sentry)
- [ ] Logs rotated
- [ ] Backup strategy
- [ ] SSL certificate
- [ ] CDN for images
