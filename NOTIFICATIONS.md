# Bell Notification System - Configuration Complete ✅

## Overview
The bell notification system is fully configured and operational in your marketplace application. Users can receive real-time notifications for various events.

## Features Implemented

### 🎯 Frontend Features
- ✅ Bell icon with unread count badge in header
- ✅ Notification dropdown with tabs (Notifications & Messages)
- ✅ Real-time toast notifications
- ✅ Mark as read functionality
- ✅ Click to navigate to relevant content
- ✅ Mobile responsive design

### 🔔 Backend Features
- ✅ Database table: `notifications`
- ✅ Notification model with proper relationships
- ✅ RESTful API endpoints
- ✅ NotificationService for all notification types
- ✅ Socket.IO integration for real-time delivery
- ✅ Automatic notification triggers

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get all notifications (paginated) |
| GET | `/api/notifications/unread` | Get unread notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| POST | `/api/notifications/{id}/read` | Mark notification as read |
| POST | `/api/notifications/mark-all-read` | Mark all as read |

## Notification Types

### Ad Notifications
- ✅ `ad_approved` - Ad approved and live
- ✅ `ad_rejected` - Ad rejected with reason
- ✅ `ad_deleted` - Ad removed by admin

### Message Notifications
- ✅ `new_message` - New message on ad

### Payment Notifications
- ✅ `payment_received` - Payment received
- ✅ `payment_approved` - Payment confirmed
- ✅ `payment_rejected` - Payment declined

### Promotion Notifications
- ✅ `promotion_activated` - Promotion started
- ✅ `promotion_expired` - Promotion ended

### User Account Notifications
- ✅ `account_verified` - Account verified
- ✅ `account_suspended` - Account suspended
- ✅ `account_banned` - Account banned
- ✅ `account_unsuspended` - Account restored

### Review Notifications
- ✅ `new_review` - New review received
- ✅ `review_received` - Review on ad

### Report Notifications
- ✅ `report_received` - Report submitted
- ✅ `report_actioned` - Report resolved/dismissed

### Admin Broadcasts
- ✅ `admin_broadcast` - Admin broadcast message

### Other Notifications
- ✅ `new_favorite` - Someone favorited your ad
- ✅ `system_notice` - System notifications

## Notification Triggers

### Automatic Triggers (Controllers)
1. **AdminController** - Ad approval/rejection, user status changes
2. **MessageController** - New messages on ads
3. **ReviewController** - New reviews
4. **ReportController** - Report actions
5. **PromotionController** - Promotion activation
6. **FavoriteController** - New favorites (NEW!)

### Manual Triggers
You can send custom notifications using:

```php
use App\Services\NotificationService;

// Simple notification
NotificationService::send($userId, $type, $title, $message, $data);

// Notification to ad owner
NotificationService::sendToAdOwner($ad, $type, $title, $message, $data);

// Pre-defined methods
NotificationService::adApproved($ad);
NotificationService::adRejected($ad, $reason);
NotificationService::newMessageOnAd($ad, $sender, $message);
NotificationService::newFavorite($ad, $user);
```

## Real-Time Delivery

### Socket.IO Integration
The notification system uses Socket.IO for real-time delivery:

1. **Backend (Laravel)**: NotificationService sends to socket server
2. **Socket Server**: Routes notification to specific user room
3. **Frontend (React)**: useSocket hook receives and displays notification

### Socket Server Configuration
```javascript
// Socket server runs on port 3001
// Endpoint: POST /emit-notification
// Payload: { userId, notification }
```

## Frontend Integration

### Header Component
Located at: `src/components/layout/Header.tsx`

Features:
- Bell icon with badge count
- Dropdown panel with tabs
- Real-time updates
- Toast notifications

### State Management
Uses Zustand store:
```typescript
// src/lib/store.ts
const { notifications, addNotification, setNotifications } = useGlobalStore();
```

### Socket Hook
```typescript
// src/hooks/useSocket.ts
const { socket } = useSocket({
  userId: user?.id,
  onNotification: handleNewNotification,
});
```

## Usage Examples

### Triggering Notifications from Controllers

```php
// Ad approved
$ad = Ad::find($id);
NotificationService::adApproved($ad);

// Ad rejected
NotificationService::adRejected($ad, 'Inappropriate content');

// New message
NotificationService::newMessageOnAd($ad, $sender, $messagePreview);

// Payment received
NotificationService::paymentApproved($payment);

// New favorite
NotificationService::newFavorite($ad, $user);

// Custom notification
NotificationService::send($userId, 'custom', 'Title', 'Message', ['key' => 'value']);

// Broadcast to all users
NotificationService::broadcastToAll('Announcement', 'Important message for all users');
```

## Testing Notifications

### 1. Test Unread Count
```bash
curl -X GET http://localhost:8000/api/notifications/unread-count \
  -H "Authorization: Bearer {token}"
```

### 2. Test Notification Creation
```bash
curl -X POST http://localhost:8000/api/notifications \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "system_notice",
    "title": "Test Notification",
    "message": "This is a test"
  }'
```

### 3. Test Real-Time (Frontend)
1. Open two browser windows
2. Login as same user in both
3. Trigger notification (e.g., favorite an ad)
4. Watch toast notification appear instantly

## Customization

### Adding New Notification Types

1. **Backend - NotificationService.php**
```php
public static function myNewNotification($target)
{
    return self::send(
        $target->user_id,
        'my_new_type',
        'New Title',
        'New message',
        ['data' => 'value']
    );
}
```

2. **Frontend - Header.tsx**
```typescript
// Add icon mapping
const NOTIFICATION_ICONS = {
  my_new_type: MyIcon,
  // ...
};

// Add color mapping
const NOTIFICATION_COLORS = {
  my_new_type: 'bg-purple-100 text-purple-600',
  // ...
};
```

3. **Frontend - Header.tsx handleNotificationClick**
```typescript
case 'my_new_type':
  router.push('/specific-page');
  break;
```

### Styling Toast Notifications

Edit `handleNewNotification` in Header.tsx:
```typescript
toast.custom((t) => (
  <div className="custom-styles...">
    {/* Custom notification UI */}
  </div>
), { duration: 5000 });
```

## Troubleshooting

### Notifications Not Appearing

1. **Check Socket Connection**
```javascript
// Browser console
console.log('Socket connected:', isConnected);
```

2. **Verify Socket Server**
```bash
curl http://localhost:3001/health
```

3. **Check Database**
```sql
SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC;
```

4. **Check API Response**
- Open Network tab in DevTools
- Look for `/api/notifications/unread-count` request
- Verify 200 status code

### Real-Time Updates Not Working

1. **Socket Server Running?**
```bash
node socket-server.js
```

2. **CORS Issues?**
Check socket-server.js CORS configuration matches your frontend URL.

3. **User Joined?**
Check socket `join` event is being emitted with userId.

## Performance Considerations

- Notifications are paginated (20 per page)
- Unread notifications cached in component state
- Socket connection maintained for real-time updates
- Old notifications auto-cleanup not implemented (manual or scheduled job)

## Future Enhancements

Potential improvements:
- Push notifications (mobile)
- Email notifications
- Notification preferences/settings
- Auto-cleanup of old notifications
- Sound effects for notifications
- Notification badges on mobile app
- Bulk notification sending

## Support

For issues or questions:
1. Check browser console for errors
2. Check Laravel logs: `storage/logs/laravel.log`
3. Check Socket server logs in terminal
4. Verify database connection and migrations

---

**Status**: ✅ Fully Operational
**Last Updated**: 2026-03-21
