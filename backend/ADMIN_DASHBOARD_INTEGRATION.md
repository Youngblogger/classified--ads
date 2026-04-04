{
  "dashboard_sections": [
    {
      "name": "Metrics Cards",
      "data_source": "/api/admin/dashboard",
      "fields": [
        "total_users",
        "total_ads",
        "active_ads",
        "pending_ads",
        "flagged_ads",
        "processing_ads",
        "total_views",
        "new_users_today",
        "new_ads_today"
      ],
      "description": "Real-time overview of marketplace statistics",
      "refresh_interval": 30
    },
    {
      "name": "Ads Queue Monitor",
      "data_source": "/api/admin/ads?processing_status=processing",
      "fields": [
        "title",
        "category",
        "processing_status",
        "verification_status",
        "ai_confidence",
        "created_at"
      ],
      "description": "Monitor ads currently being processed by AI pipeline",
      "actions": [],
      "refresh_interval": 10
    },
    {
      "name": "Flagged Ads Queue",
      "data_source": "/api/admin/ads/flagged",
      "fields": [
        "id",
        "title",
        "category",
        "verification_status",
        "rejection_reason",
        "image_validation",
        "ai_confidence",
        "created_at"
      ],
      "description": "Ads flagged by AI validation (suspicious content, low confidence, image issues)",
      "actions": [
        {
          "name": "verify",
          "endpoint": "/api/admin/ads/{id}/verify",
          "method": "POST",
          "label": "Mark as Verified"
        },
        {
          "name": "reprocess",
          "endpoint": "/api/admin/ads/{id}/reprocess",
          "method": "POST",
          "label": "Reprocess"
        },
        {
          "name": "reject",
          "endpoint": "/api/admin/ads/{id}/reject",
          "method": "POST",
          "label": "Reject Ad",
          "params": ["reason"]
        },
        {
          "name": "view_details",
          "endpoint": "/api/ads/{slug}",
          "method": "GET",
          "label": "View Full Details"
        }
      ],
      "workflow": {
        "step1": "Review flagged reason (image_validation.issues/flags)",
        "step2": "Check ad content and images",
        "step3": "Verify → sets verification_status=verified",
        "step4": "Or reject → sets status=rejected with reason"
      }
    },
    {
      "name": "All Ads Management",
      "data_source": "/api/admin/ads",
      "fields": [
        "id",
        "title",
        "user_id",
        "category_id",
        "price",
        "status",
        "verification_status",
        "processing_status",
        "is_featured",
        "ai_confidence",
        "views",
        "created_at"
      ],
      "filters": [
        {
          "name": "status",
          "options": ["pending", "active", "sold", "expired", "rejected"]
        },
        {
          "name": "verification_status",
          "options": ["pending", "verified", "flagged", "rejected"]
        },
        {
          "name": "processing_status",
          "options": ["pending", "processing", "completed", "failed"]
        },
        {
          "name": "search",
          "placeholder": "Search by title..."
        }
      ],
      "actions": [
        {
          "name": "view_details",
          "endpoint": "/api/ads/{slug}",
          "method": "GET"
        },
        {
          "name": "approve",
          "endpoint": "/api/admin/ads/{id}/approve",
          "method": "POST",
          "label": "Approve"
        },
        {
          "name": "reject",
          "endpoint": "/api/admin/ads/{id}/reject",
          "method": "POST",
          "label": "Reject"
        },
        {
          "name": "verify",
          "endpoint": "/api/admin/ads/{id}/verify",
          "method": "POST",
          "label": "Verify"
        },
        {
          "name": "reprocess",
          "endpoint": "/api/admin/ads/{id}/reprocess",
          "method": "POST",
          "label": "Reprocess"
        },
        {
          "name": "delete",
          "endpoint": "/api/admin/ads/{id}",
          "method": "DELETE",
          "label": "Delete"
        }
      ],
      "pagination": {
        "per_page": 20,
        "page_param": "page"
      }
    },
    {
      "name": "Search Analytics",
      "data_source": "/api/search/trending",
      "fields": [
        "id",
        "title",
        "views",
        "category",
        "created_at"
      ],
      "description": "Top performing ads by views in last 7 days",
      "additional_queries": {
        "top_keywords": "Track search query logs separately",
        "no_results_queries": "Log searches that return 0 results"
      }
    },
    {
      "name": "AI Performance Stats",
      "data_source": "/api/admin/dashboard",
      "custom_query": "SELECT COUNT(*) as total, verification_status FROM ads GROUP BY verification_status",
      "fields": [
        "verified_count",
        "flagged_count", 
        "pending_verification_count",
        "avg_ai_confidence",
        "low_confidence_ads_count"
      ],
      "description": "AI categorization and verification statistics",
      "display": {
        "chart_type": "doughnut",
        "labels": ["Verified", "Flagged", "Pending"]
      }
    },
    {
      "name": "Categories Overview",
      "data_source": "/api/categories",
      "fields": [
        "id",
        "name",
        "slug",
        "ad_count",
        "children"
      ],
      "description": "Category distribution of ads"
    },
    {
      "name": "Featured Ads Manager",
      "data_source": "/api/admin/ads?is_featured=true",
      "fields": [
        "id",
        "title",
        "category",
        "views",
        "expires_at"
      ],
      "actions": [
        {
          "name": "toggle_featured",
          "endpoint": "/api/admin/ads/{id}/toggle-featured",
          "method": "POST"
        }
      ]
    },
    {
      "name": "Reprocess Queue",
      "data_source": "CLI Command",
      "endpoint": "php artisan ads:reprocess",
      "description": "Bulk reprocess unprocessed ads",
      "options": [
        {
          "name": "--force",
          "description": "Process all ads regardless of status"
        }
      ]
    }
  ],
  "notifications": [
    {
      "event": "new_flagged_ad",
      "source": "ProcessAdJob image validation",
      "trigger": "verification_status = flagged",
      "channels": ["dashboard_badge", "email"],
      "priority": "high"
    },
    {
      "event": "processing_failed",
      "source": "ProcessAdJob",
      "trigger": "processing_status = failed",
      "channels": ["dashboard_badge"],
      "priority": "medium"
    },
    {
      "event": "low_ai_confidence",
      "source": "HybridCategorizationService",
      "trigger": "ai_confidence < 60",
      "channels": ["dashboard_badge"],
      "priority": "medium"
    },
    {
      "event": "pending_approval",
      "source": "AdController store",
      "trigger": "status = pending",
      "channels": ["dashboard_badge"],
      "priority": "normal"
    },
    {
      "event": "featured_expiring",
      "source": "Scheduled job",
      "trigger": "featured ad expires within 24h",
      "channels": ["dashboard_badge", "email"],
      "priority": "low"
    }
  ],
  "analytics": [
    {
      "name": "Trending Ads",
      "endpoint": "/api/search/trending",
      "metric": "views",
      "timeframe": "last_7_days",
      "limit": 10,
      "chart_type": "bar"
    },
    {
      "name": "AI Confidence Distribution",
      "metric": "ai_confidence",
      "ranges": [
        {"label": "High (80-100)", "min": 80, "max": 100},
        {"label": "Medium (60-79)", "min": 60, "max": 79},
        {"label": "Low (0-59)", "min": 0, "max": 59}
      ],
      "chart_type": "histogram"
    },
    {
      "name": "Verification Status Breakdown",
      "metric": "verification_status",
      "group_by": "verification_status",
      "chart_type": "doughnut"
    },
    {
      "name": "Processing Queue Health",
      "metrics": [
        "pending_count (processing_status = pending)",
        "processing_count (processing_status = processing)",
        "failed_count (processing_status = failed)",
        "completed_today (processed_at today)"
      ],
      "chart_type": "number_cards"
    },
    {
      "name": "Category Performance",
      "metric": "ads per category",
      "includes": ["ad_count", "avg_views", "avg_price"],
      "chart_type": "table"
    },
    {
      "name": "Search Relevance Score Avg",
      "metric": "Calculated from search results",
      "description": "Average relevance_score for top search results",
      "chart_type": "line"
    }
  ],
  "real_time_updates": {
    "polling_interval": 30,
    "endpoints_to_poll": [
      "/api/admin/dashboard",
      "/api/admin/ads/flagged"
    ],
    "websocket_channels": [
      "admin.notifications",
      "ads.processing_updates"
    ]
  },
  "integration_checklist": {
    "must_have": [
      "Flagged ads queue with approve/reject/reprocess actions",
      "Processing status indicator on each ad",
      "AI confidence score display",
      "Image validation issues display",
      "Bulk reprocess button"
    ],
    "should_have": [
      "Real-time badge for new flagged ads",
      "AI performance charts",
      "Search analytics",
      "Featured ads management"
    ],
    "nice_to_have": [
      "Search query logs",
      "A/B testing for AI prompts",
      "Custom rule configuration UI",
      "Admin override for AI categorization"
    ]
  },
  "api_endpoints_summary": {
    "GET": {
      "/api/admin/dashboard": "Stats overview",
      "/api/admin/ads": "All ads with filters",
      "/api/admin/ads/flagged": "Flagged ads only",
      "/api/search/trending": "Trending ads"
    },
    "POST": {
      "/api/admin/ads/{id}/approve": "Approve ad",
      "/api/admin/ads/{id}/reject": "Reject ad with reason",
      "/api/admin/ads/{id}/verify": "Verify ad",
      "/api/admin/ads/{id}/reprocess": "Queue for reprocessing"
    },
    "DELETE": {
      "/api/admin/ads/{id}": "Delete ad"
    }
  },
  "recommended_frontend_libraries": {
    "charts": "Chart.js or ApexCharts",
    "tables": "DataTables with server-side pagination",
    "notifications": "Toast notifications (vue-toastification or similar)",
    "real_time": "Pusher or Socket.io"
  }
}
