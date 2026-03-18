# Admin Panel Feature Specification

## Current System Overview

The application currently has:
- **User Dashboard** at `/dashboard` with personal stats (Active Ads, Pending Ads, Sold Ads, Messages, Favorites)
- **Backend API** (Laravel) with endpoints for ads, categories, locations, users, messages, favorites, banners, notifications, and reports
- **Database** with migrations for users, categories, locations, ads, ad_images, favorites, conversations, messages, reviews, reports, notifications, banners, and specifications

---

## Proposed Admin Panel Features

### 1. Dashboard Overview (`/admin`)
- **Statistics Cards**: Total Users, Total Ads, Active Ads, Pending Approval, Total Revenue
- **Recent Activity Feed**: New registrations, new ads, reported content
- **Quick Actions**: Approve pending ads, manage users, view reports

### 2. Ad Management (`/admin/ads`)
- **List All Ads**: Table view with filters (status, category, date range)
- **View Ad Details**: Full ad information with images
- **Approve/Reject Ads**: Pending ads workflow
- **Edit Ads**: Modify ad content, price, status
- **Delete Ads**: Remove inappropriate content
- **Feature Ads**: Mark ads as featured

### 3. User Management (`/admin/users`)
- **List All Users**: Table with search, filters (role, verified status, date)
  - **All Users**: Complete user list
  - **Verified Users**: Users with verified status
  - **Unverified Users**: Users pending verification
- **View User Profile**: User details, listed ads, activity
- **Verify Users**: Toggle verified status
- **Suspend/Activate Users**: Account management
- **View User Messages**: Chat history

### 4. Category Management (`/admin/categories`)
- **List Categories**: Hierarchical view
- **Create/Edit Category**: Name, slug, icon, parent category
- **Delete Category**: With ads reassignment option

### 5. Location Management (`/admin/locations`)
- **List Locations**: Hierarchical (Country > State > City)
- **Create/Edit Location**: Name, slug, parent
- **Delete Location**: With ads reassignment

### 6. Reports Management (`/admin/reports`)
- **List Reports**: Table with status filters (pending, resolved, rejected)
- **View Report Details**: Reported ad, reporter, reason
- **Take Action**: Resolve report, delete content, warn user

### 7. Reviews Management (`/admin/reviews`)
- **List Reviews**: All user reviews
- **Delete Reviews**: Remove inappropriate reviews

### 8. Banner Management (`/admin/banners`)
- **List Banners**: Active/inactive
- **Create/Edit Banner**: Image, link, position, dates
- **Delete Banner**

### 9. Settings (`/admin/settings`)
- **Site Settings**: Site name, logo, contact email
- **Approval Settings**: Auto-approve ads toggle
- **Feature Limits**: Max featured ads, etc.

---

## API Endpoints to Add (Backend)

```php
// Admin routes - require admin middleware
Route::prefix('admin')->middleware(['auth:sanctum', 'admin'])->group(function () {
    // Dashboard
    Route::get('/dashboard/stats', [AdminController::class, 'stats']);
    Route::get('/dashboard/activity', [AdminController::class, 'recentActivity']);
    
    // User Management
    Route::get('/users', [AdminUserController::class, 'index']);
    Route::get('/users/verified', [AdminUserController::class, 'verified']);
    Route::get('/users/unverified', [AdminUserController::class, 'unverified']);
    Route::get('/users/{id}', [AdminUserController::class, 'show']);
    Route::put('/users/{id}/verify', [AdminUserController::class, 'toggleVerify']);
    Route::put('/users/{id}/status', [AdminUserController::class, 'toggleStatus']);
    
    // Ad Management
    Route::get('/ads', [AdminAdController::class, 'index']);
    Route::get('/ads/pending', [AdminAdController::class, 'pending']);
    Route::put('/ads/{id}/approve', [AdminAdController::class, 'approve']);
    Route::put('/ads/{id}/reject', [AdminAdController::class, 'reject']);
    Route::put('/ads/{id}/feature', [AdminAdController::class, 'toggleFeature']);
    Route::delete('/ads/{id}', [AdminAdController::class, 'destroy']);
    
    // Category Management
    Route::post('/categories', [AdminCategoryController::class, 'store']);
    Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
    Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);
    
    // Location Management
    Route::post('/locations', [AdminLocationController::class, 'store']);
    Route::put('/locations/{id}', [AdminLocationController::class, 'update']);
    Route::delete('/locations/{id}', [AdminLocationController::class, 'destroy']);
    
    // Reports
    Route::get('/reports', [AdminReportController::class, 'index']);
    Route::put('/reports/{id}/resolve', [AdminReportController::class, 'resolve']);
    Route::put('/reports/{id}/reject', [AdminReportController::class, 'reject']);
    
    // Banners
    Route::get('/banners', [AdminBannerController::class, 'index']);
    Route::post('/banners', [AdminBannerController::class, 'store']);
    Route::put('/banners/{id}', [AdminBannerController::class, 'update']);
    Route::delete('/banners/{id}', [AdminBannerController::class, 'destroy']);
    
    // Settings
    Route::get('/settings', [AdminSettingsController::class, 'show']);
    Route::put('/settings', [AdminSettingsController::class, 'update']);
});
```

---

## Page Structure

```
/admin
├── layout.tsx          # Admin layout with sidebar navigation
├── page.tsx            # Dashboard overview
├── ads/
│   ├── page.tsx       # All ads list
│   ├── pending/       # Pending approvals
│   └── [id]/          # Ad detail/edit
├── users/
│   ├── page.tsx       # All users
│   └── [id]/          # User detail
├── categories/
│   └── page.tsx       # Category CRUD
├── locations/
│   └── page.tsx       # Location CRUD
├── reports/
│   └── page.tsx       # Reports management
├── banners/
│   └── page.tsx       # Banner management
└── settings/
    └── page.tsx       # Site settings
```

---

## Implementation Priority

1. **Phase 1**: Dashboard, Ad Management (approve/reject), Pending Ads
2. **Phase 2**: User Management, Reports
3. **Phase 3**: Categories, Locations, Banners
4. **Phase 4**: Settings, Advanced features
