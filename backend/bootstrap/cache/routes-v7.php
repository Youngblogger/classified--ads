<?php

app('router')->setCompiledRoutes(
    array (
  'compiled' => 
  array (
    0 => false,
    1 => 
    array (
      '/sanctum/csrf-cookie' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'sanctum.csrf-cookie',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/register' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'register',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/validate-referral-code' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Mgb8TDguKhLPpuj0',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/login' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'login',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/google' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::TKK8Fpr8ZNTdmTAT',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'POST' => 1,
            'HEAD' => 2,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/facebook' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::4b0Fg2hRc2i5OkA1',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'POST' => 1,
            'HEAD' => 2,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/register-otp' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::dyys9vpyq8tkV4kO',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/verify-otp' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Xokl9Xi1AOLgP961',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/resend-otp' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1IwNnVGXlDPt3myl',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/check-otp-status' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Mz8E4edMQwCyzCxF',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/auth/login' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::BlnKAEDawlMg8anO',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/auth/logout' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::c8fINAAFhKEFUfN9',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/auth/me' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Y6JpHEJFzPb0jKKx',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/auth/refresh' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::88g1SoEAVfDD49xQ',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/auth/activity-logs' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::I1nZNDqp7s6AuIlX',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/auth/suspicious-activity' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::aOPYtSqNzLtdcAaO',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/dashboard' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::PqnaUV02aT3njZwZ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/notifications' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::svDZSGsq29CyA3q3',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/ads' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Ff9HyxBereaIKiCu',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/ads/flagged' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::EpA14nsHjs2L8hnC',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/ads/moderation/stats' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::oog1pP1cV1VyLBmg',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/ads/moderation/analyze' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::rDNQnyBIzxVCBjCA',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/ads/moderation/fix-all' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::dvJYYtyV3XuvqGrR',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/ads/moderation/bulk-fix' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::QCs1WFOYFiKV7FVK',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/ads/moderation/logs' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::2xa1WsHJG64AyTTA',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/users' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::8R9WtTBnpDLcoZnX',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/categories' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::hV179HXChmikonhZ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::iN21CZbyVTQc2W43',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/locations' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::EdUV9eIOWVY3W6Wb',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::iKeiyzaMGfkWUp2c',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/reports' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::6hqxQ2MmydweXrrm',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/analytics' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::e4sQ2pN9PTJ4SEdp',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/analytics/states' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Pq2xnUeuMqQfjZ1e',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/messages' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::8nj3CYmobI7AhdDZ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/broadcasts' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::SWUGJ9tTZkDcSfyh',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/broadcast' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::fJZ34hUdJqM1CtgC',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/settings' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::LoEcVhDuh0jvEHDI',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::mBqjAr02EHXqcCS8',
          ),
          1 => NULL,
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/watermark' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Xw4U2HlWd7ulXbUw',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::12fCl1T0BMhgZa0D',
          ),
          1 => NULL,
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/watermark/logo' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::XyD8JDDEH5OT2RCU',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/fonts' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1xDKrcgR71LZV9CW',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1hPF6aUfYhABr9EC',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/bank-transfers' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::22Ywui2yZyDwKk9p',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/bank-transfers/stats' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::K5KUOEBDmJnznlui',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/banners' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Cp2YOZteylZX8hFd',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::XLGybwEkhZHB9Z2m',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/social/post-ad' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::eoKg5BksJy6Bb4KW',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/social/post-ads-batch' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::oUQewEpFZDIq5cwy',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/social/posts' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::jlit8pd0pufo2ctZ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/social/scheduled' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::wwHDDM0d8jyzNzC7',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/social/stats' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::LADt8KFR2WhMuJv7',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/social/settings' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::dNdXDjd1KcDU1InM',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::GYX7xMLz6SO43MHc',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/social/settings/test' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::vu8AjezaLf3XRueU',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/payments' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::9NXPCKnnddXVS8cP',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/payments/summary' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::T0UUV6oFFvcZRR4U',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/boosts' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::UpapmN7EfdGVvaUt',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/boosts/active-ads' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::v1mmsC89zZs7Ydfd',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/boost/plans' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::c5UmiWUrODiPpo71',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::9P2yVP8JQBYJQxBU',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/boost/boosts' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::oVkI74WxGpSW607V',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/boost/summary' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::EC4zEtE5qfe5ZkKb',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/analytics/summary' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::GVNtVejA7f0ItzOZ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/analytics/trends' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::tnkf4rAtbvsA9F3h',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/secure-control-9ja/analytics/revenue' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::zkFqjxRM0bC9bMGZ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/login' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::SZZPfzUxV3Y4k2ES',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/logout' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::11abpDvRDHN8zXN6',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/me' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::X0ro1Sq0AS2JBbJV',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/refresh' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::P0IfGLnWLDJdTnuB',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/admin/activity-logs' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Z89hTEgzfq7k0iC8',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/logout' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::c0zPvNPf8dqeoHNx',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/me' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::l8bn5WXuEvLZauVO',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/profile' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::B9XbntrAggCEr47f',
          ),
          1 => NULL,
          2 => 
          array (
            'PUT' => 0,
            'POST' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/profile/avatar' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::jcScwG3cqXXIxrum',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/change-password' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::eoWqNpEFaqyWrqRY',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/auth/delete-account' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::0aMic4ASiDXWtezw',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/categories' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ILJ0O4ckTB7LvGVY',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/categories/all' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::a8fVIZ0UnPiu6zGt',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/category-fields' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Vh3foQyQKG0yxHaj',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::7vMuy034X9lqilbi',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/locations' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::t7WgZCRx8nxeYppn',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/icons' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::K1iTtsXz3aP0QTaM',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/icons/search' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::vq60meVZTRcuAduT',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/icons/custom' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::0DzsSec3m3I0FUg9',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/icons/upload' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::YbdDit4vtDRXIfii',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/search' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::tBOC5Nnzb7wFdnvp',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/search/advanced' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::o0DGU3l5kn9tuVld',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/search/suggestions' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::xcs7YYSK8dZxRLHF',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/search/trending' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::d9CBVjJFGH360Q8f',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/search/recent' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::vBmOn0vNOTMWfsFR',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/banners/active' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::kEhqAIQxikXwgPwb',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/cloudinary/config' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::BySyy4uCie4tv2p7',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/cloudinary/upload-params' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::5vQDpisKIzfD4DGL',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/cloudinary/upload-callback' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::f1kRNoX3omR1vdPP',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/cloudinary/validate-image' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::uPSrbmSmqsmgZDAD',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/homepage' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1cqrOljLbnX7RnmI',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/homepage/clear-cache' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::GagEn3Shp7KdCNxX',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/ads' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::FkusvEXyWxZ3geU3',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::tyfYRcoyzTehGEQw',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/ads/ranking' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::eYxr58nZmczOsfTg',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/ads/featured' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::h71UQvlRn2bpxvuR',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/ads/recent' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::eLOaVYDN2WSeB8yo',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/ads/similar' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::H2LLqgRj4WrDJWvs',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/ads/boost-prices' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::tVF52IVHFIpsRmbZ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/ads/boost-plans' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::K0g3NKHwuNMDQPcr',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/reports' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::jhKFHvH1GWGgpFRe',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/my-ads' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::sOBqpISpp8eVtTvx',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/my-boosts' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::U7wrHvdEdBZDqfzp',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/user/saved-ads' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Cc926C5HBxE9Z9dj',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/user/recently-viewed' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::g8PN9nVofUNglcIW',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::In6UEdkJz2BLgb62',
          ),
          1 => NULL,
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/notifications' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::gzxao8qAA6BMIyfQ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/notifications/unread' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::oecjeHeGFBLi7vEJ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/notifications/unread-count' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::gmBOfvHcleAb2UVb',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/notifications/mark-all-read' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::KUBcUigzReUNIjTg',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/favorites' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::d2xcTuohRVhhtBON',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::davzWgjisr45Tm67',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/messages/conversations' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::sZVGjkjDZC7KHdm9',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/messages/conversation/get-or-create' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::v1uI3QTCtIdmqYSZ',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/messages' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::6zD7N4UcBAtpOVaJ',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/follow' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Mlume7JJVIzCvLKn',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/unfollow' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::OW4SdBbW6IYDn6xz',
          ),
          1 => NULL,
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/follow/check' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::QllyM3jlUKdWdPOl',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/feed/following' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::kBgLGkvmth9fyrBI',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/sellers/suggested' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::r9khyQHyHn4jcWUb',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/reviews/my-reviews' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1DoMbyJdtlpmzUQ3',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/reviews' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::D1zojseXLnQk5zC9',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/wallet' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::d8HtxNgDx4Gbqkql',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/wallet/balance' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::4SRe4Tev67P6aeIn',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/wallet/fund' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::YnKV3oDA7UF054wJ',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/wallet/verify' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::O9dSrX9tHzwN7vh4',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/wallet/check-balance' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::YNZZEFelzKqheZGi',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/wallet/bank-transfer-proof' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::v3RBq44QV8ofT2Ho',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/referral/my-code' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::YSY49ZopVGsrUnVB',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/referral/my-referrals' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::NIgv55Fi77NaPfDN',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/referral/referred-by-me' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::L7cwBAU564dJWgYL',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/referral/stats' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::AkQp5kXrocTeTpMs',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/referral/leaderboard' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::mHWuQkAnjH2l1eJ1',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/referral/apply' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::gQd2KbrVsdYUODO9',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/referral/reward' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::OdPiN1wIUC0W25Ys',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/referral/validate' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::kUgAMJEiK2x4x381',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/credits/balance' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::wp1OCCPbxhDOTakK',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/credits/history' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::lMGE6GYZTyETn0qj',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/credits/features' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::RmIDAuMuRsUy7qNE',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/credits/use' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::B5ECOkSgNQBYHAJg',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/credits/check-balance' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ZqX1cM1H7SP5RXkg',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/webhooks/paystack' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::y4493Jp5Ni5p2O4j',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/payments/verify' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::C9Ql8PmKGexm2wud',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/payments/callback' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'payments.callback',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/api/test' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::h9LNPk64FSTeBcbt',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::DrkxcShWdJ2sVCJy',
          ),
          1 => NULL,
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/up' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::BC9dEKqeAUqDw42n',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      '/' => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::cgur33AShZKWb1R9',
          ),
          1 => NULL,
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
    ),
    2 => 
    array (
      0 => '{^(?|/api/(?|se(?|cure\\-control\\-9ja/(?|notifications/([^/]++)/read(*:69)|ad(?|/([^/]++)(?|(*:93)|/image(?|s(?|(*:113)|/order(*:127))|/([^/]++)(*:145)))|s(?|/(?|([^/]++)(?|/(?|approve(*:185)|re(?|ject(*:202)|process(*:217))|verify(*:232)|feature(*:247)|promote(*:262))|(*:271))|bulk\\-delete(*:292)|moderation(*:310)|([^/]++)/(?|delete\\-images(*:344)|replace\\-images(*:367)))|\\-moderation/([^/]++)(?|(*:401)|/fix(*:413))))|users/([^/]++)(?|(*:441)|/(?|suspend(*:460)|ban(*:471)|activate(*:487)))|categories/([^/]++)(?|(*:519))|locations/([^/]++)(?|(*:549))|reports/([^/]++)/resolve(*:582)|fonts/([^/]++)(?|(*:607)|/default(*:623))|b(?|an(?|k\\-transfers/([^/]++)/(?|approve(*:673)|reject(*:687))|ners/(?|([^/]++)(?|(*:715))|reorder(*:731)))|oost(?|s/([^/]++)/(?|deactivate(*:772)|extend(*:786))|/(?|plans/([^/]++)(?|(*:816))|boosts/([^/]++)/(?|deactivate(*:854)|extend(*:868)))))|social/(?|retry/([^/]++)(*:904)|cancel/([^/]++)(*:927)|settings/([^/]++)(*:952)))|ller(?|s/([^/]++)/(?|r(?|eviews(?|(*:996)|/latest(*:1011)|(*:1020))|ating(*:1035))|profile(*:1052)|can\\-review(*:1072)|my\\-review(*:1091))|\\-reviews/([^/]++)(?|(*:1122)|/(?|helpful(*:1142)|report(*:1157)))))|categor(?|ies/([^/]++)(?|(*:1195)|/fields(*:1211))|y\\-fields/(?|([^/]++)(?|(*:1245))|reorder(*:1262)))|locations/([^/]++)(*:1291)|icons/c(?|ategory/([^/]++)(*:1326)|ustom/([^/]++)(*:1349))|ads/(?|([^/]++)/(?|track\\-click(*:1390)|share\\-link(*:1410))|((?=.*[a-z])[a-z0-9\\-]+)(*:1444)|([^/]++)/reviews(?|(*:1472)|/(?|summary(*:1492)|latest(*:1507)))|boost\\-on\\-publish(*:1536)|([0-9]+)(?|(*:1556))|([^/]++)(?|(*:1577)|/(?|close(*:1595)|re(?|new(*:1612)|views(*:1626))|images(?|(*:1645)|/([^/]++)(?|(*:1666)))|boost(?|(*:1685)|\\-(?|status(*:1705)|renew(?|(*:1722)|al\\-check(*:1740))))|save(?|(*:1759)|d\\-check(*:1776))|unsave(*:1792))))|notifications/(?|([^/]++)(?|/read(*:1837)|(*:1846))|delete\\-all(*:1867))|favorites/(?|([^/]++)(*:1898)|check/([^/]++)(*:1921))|messages/(?|([^/]++)(?|(*:1954))|start(*:1969)|([^/]++)/read(*:1991)|message/([^/]++)(*:2016))|users/([^/]++)/(?|follow(?|ers(*:2056)|ing(*:2068))|stats(*:2083))|reviews/(?|user/([^/]++)(*:2117)|([^/]++)/(?|helpful(*:2145)|report(*:2160)|like(?|(*:2176))))|payments/status/([^/]++)(*:2212))|/storage/(.*)(?|(*:2238)))/?$}sDu',
    ),
    3 => 
    array (
      69 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::KtlJNYnXSoSsXQkF',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      93 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::iwX21RvYXEqEi7B0',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::HyvRNByy73AprH0H',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      113 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ifGJHRnldjkZ2OO3',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      127 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::0wppu9dOXTXsQMfE',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      145 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::8bhkAlAJA8t0ASHO',
          ),
          1 => 
          array (
            0 => 'id',
            1 => 'imageId',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      185 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Su3tPD0FTsF6XtQ5',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      202 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::o0CvV2lDXZr0uGnz',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      217 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::IxdqkFnMNzT27KGE',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      232 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::mAtu5mSw19xrQukh',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      247 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::hg9h6PzKUGXfgZ2z',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      262 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::IJucjommkDU23sKK',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      271 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::j22GvT6lKLbL7MPO',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      292 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::rccTr5M88alV9hxz',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      310 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::glluMxM0qJDGhpxy',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      344 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Oh7q1Fxfkr30dAbE',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      367 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::PYJkWHnfazwjVF91',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      401 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::KBeM2yCap7EboN5G',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      413 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::LrXS4VyRxVDmCDQG',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      441 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::SL46PdNSCCuoc0DT',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::LZJ2zDtQPRAcpB3k',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      460 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::LNbQ5xObNlMRJ2RO',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      471 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::l0PGoMXk9cfHQw64',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      487 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::NG06zIljuhB6k9wb',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      519 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::08abMSBmZHpoFsTD',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::nJpbJBJyHNnEJH7L',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      549 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::bZeTS1unGklVditG',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::nbt6jOfacWel8hJC',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      582 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::3Z9jc0paAi4vOKtT',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      607 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::T8UBzSPGo135IGki',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      623 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ojsqCrP4PiXCDESm',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      673 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::30eNUcJlw0YotDUx',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      687 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::IQAPjxPWJbniRzBG',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      715 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::oxOjFUKu28GlTPJt',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::DULm2LUScZpS5IrQ',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      731 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::t9XpBB0vcjniex8z',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      772 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1bYJXxRQsyWnpcnd',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      786 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::YjVTAFrhdLa6VmJN',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      816 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::99Mcx9iMKcrlvD1h',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Yfiot4HSO0UQE0Mf',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      854 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::vjK06A5HVtG80XRw',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      868 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::9DjWYZILUyCpwNRX',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      904 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::F88eAa8ccvJstHoI',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      927 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ZjO6Uns6QDhDC2tt',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      952 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::AAJOB98bJtO3byDe',
          ),
          1 => 
          array (
            0 => 'platform',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      996 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::BRkmwZXNOuSPokL2',
          ),
          1 => 
          array (
            0 => 'sellerId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1011 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::0UkFgRQnuxpiOVOB',
          ),
          1 => 
          array (
            0 => 'sellerId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1020 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ICOIXhVuPsTvD1U2',
          ),
          1 => 
          array (
            0 => 'sellerId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1035 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::tNgcosdmcqATMdGY',
          ),
          1 => 
          array (
            0 => 'sellerId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1052 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::rqCwQJmc34AivYBM',
          ),
          1 => 
          array (
            0 => 'sellerId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1072 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::bNqksprmJU2mEU4n',
          ),
          1 => 
          array (
            0 => 'sellerId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1091 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::WJ33mAPaaPzEyLzb',
          ),
          1 => 
          array (
            0 => 'sellerId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1122 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::NHwCvXMPU8ojrfIU',
          ),
          1 => 
          array (
            0 => 'reviewId',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::gIfHsxrGqHrTQUXC',
          ),
          1 => 
          array (
            0 => 'reviewId',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1142 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::YzGOcKsXDzp71uir',
          ),
          1 => 
          array (
            0 => 'reviewId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1157 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::APzfw1xPmXSmqSvG',
          ),
          1 => 
          array (
            0 => 'reviewId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1195 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::uxrTTLG1upw1TqzB',
          ),
          1 => 
          array (
            0 => 'slug',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1211 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::5oX8TvZTMSLFu66o',
          ),
          1 => 
          array (
            0 => 'category',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1245 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::INw3rVyKJiW9V3Fd',
          ),
          1 => 
          array (
            0 => 'field',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::quvjHOpz01Hx4XJA',
          ),
          1 => 
          array (
            0 => 'field',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1262 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::xIa8rCmQAkQmkdwA',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1291 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::XmymJUqGMFXTAbfH',
          ),
          1 => 
          array (
            0 => 'slug',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1326 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::EiB4sRe22uHMsa72',
          ),
          1 => 
          array (
            0 => 'category',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1349 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::KSoGtofUoHvNbOqo',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1390 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::f0XlJK7tnvJXMxGY',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1410 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::MAhO5QYUChq7fJRY',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1444 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::2IhvkeMsnaaTliHM',
          ),
          1 => 
          array (
            0 => 'slug',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1472 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::VF3urJyDj2d2sN88',
          ),
          1 => 
          array (
            0 => 'adId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1492 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::QIoaUZAxAxGcM4eC',
          ),
          1 => 
          array (
            0 => 'adId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1507 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::6Ey87rBJVwG0078U',
          ),
          1 => 
          array (
            0 => 'adId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1536 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::WjA8Y8ERwP7FOKHc',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1556 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::IhEDGdMvsxKQwDmY',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::KfFS9Y5FLoQ4xMsn',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
            'PUT' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1577 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::8YmWBKslYil92gFq',
          ),
          1 => 
          array (
            0 => 'slug',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::VmzUyRYxoyPrHZOe',
          ),
          1 => 
          array (
            0 => 'slug',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1595 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::zn8qBRwyjzloJbeh',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1612 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::cb8sGIEX058hU90u',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1626 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::qwcga76IC9YLCFeS',
          ),
          1 => 
          array (
            0 => 'adId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1645 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ExbbJKzwA8PzBGyT',
          ),
          1 => 
          array (
            0 => 'adId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1666 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::KkiIfH3B8Y90Zz3K',
          ),
          1 => 
          array (
            0 => 'adId',
            1 => 'imageId',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::sROAG47vgNSiOmcv',
          ),
          1 => 
          array (
            0 => 'adId',
            1 => 'imageId',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1685 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::0b3GlZjox3Igk7q0',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1705 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::0yMwiISToPbpeLBp',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1722 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::g2xKhMyiSSuvoe44',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1740 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ghZJO665vxJOZthm',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1759 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::b4zqMkDS19Q1H8nt',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1776 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::UCFTnlsAYM7yJVjP',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1792 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::HpdHTengWWqWQrJB',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1837 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::aMmvRsfTRIdYxPlZ',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1846 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::1WYDSNUzVAzovOiq',
          ),
          1 => 
          array (
            0 => 'id',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1867 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::FHFNDqDtaJtNAC5r',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1898 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::BCUzDNr3vW1lQ8Fm',
          ),
          1 => 
          array (
            0 => 'adId',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1921 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::VqXAhmv9nzBXDzkV',
          ),
          1 => 
          array (
            0 => 'adId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1954 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::uG8HI5mYacpUJ5U1',
          ),
          1 => 
          array (
            0 => 'conversationId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::foBrPVhJnj2Pwhia',
          ),
          1 => 
          array (
            0 => 'conversationId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      1969 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Ukd9LK19N2nWnKm0',
          ),
          1 => 
          array (
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      1991 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::IfTuS1iO7mpcJiP2',
          ),
          1 => 
          array (
            0 => 'conversationId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2016 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::GdxnArSTaJ7K253Y',
          ),
          1 => 
          array (
            0 => 'messageId',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      2056 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ct8EokHS0nZuXFui',
          ),
          1 => 
          array (
            0 => 'userId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2068 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::d1QP7D4OiF3Iohmr',
          ),
          1 => 
          array (
            0 => 'userId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2083 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::Uq0AiNiCH7E9onFR',
          ),
          1 => 
          array (
            0 => 'userId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2117 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::9oe5qddsezsIpr67',
          ),
          1 => 
          array (
            0 => 'userId',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      2145 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::ArcTWjyXtECL0hbx',
          ),
          1 => 
          array (
            0 => 'reviewId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2160 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::slzLbnD1D38LV46a',
          ),
          1 => 
          array (
            0 => 'reviewId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2176 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::9lybkKuXzzUcnuLc',
          ),
          1 => 
          array (
            0 => 'reviewId',
          ),
          2 => 
          array (
            'POST' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'generated::sduJLVojxOo8AZEp',
          ),
          1 => 
          array (
            0 => 'reviewId',
          ),
          2 => 
          array (
            'DELETE' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => false,
          6 => NULL,
        ),
      ),
      2212 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'generated::zmZx0wVOSxkbqSOq',
          ),
          1 => 
          array (
            0 => 'reference',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
      ),
      2238 => 
      array (
        0 => 
        array (
          0 => 
          array (
            '_route' => 'storage.local',
          ),
          1 => 
          array (
            0 => 'path',
          ),
          2 => 
          array (
            'GET' => 0,
            'HEAD' => 1,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        1 => 
        array (
          0 => 
          array (
            '_route' => 'storage.local.upload',
          ),
          1 => 
          array (
            0 => 'path',
          ),
          2 => 
          array (
            'PUT' => 0,
          ),
          3 => NULL,
          4 => false,
          5 => true,
          6 => NULL,
        ),
        2 => 
        array (
          0 => NULL,
          1 => NULL,
          2 => NULL,
          3 => NULL,
          4 => false,
          5 => false,
          6 => 0,
        ),
      ),
    ),
    4 => NULL,
  ),
  'attributes' => 
  array (
    'sanctum.csrf-cookie' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'sanctum/csrf-cookie',
      'action' => 
      array (
        'uses' => 'Laravel\\Sanctum\\Http\\Controllers\\CsrfCookieController@show',
        'controller' => 'Laravel\\Sanctum\\Http\\Controllers\\CsrfCookieController@show',
        'namespace' => NULL,
        'prefix' => 'sanctum',
        'where' => 
        array (
        ),
        'middleware' => 
        array (
          0 => 'web',
        ),
        'as' => 'sanctum.csrf-cookie',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'register' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/register',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@register',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@register',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'register',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Mgb8TDguKhLPpuj0' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/validate-referral-code',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReferralController@validateCode',
        'controller' => 'App\\Http\\Controllers\\Api\\ReferralController@validateCode',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::Mgb8TDguKhLPpuj0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'login' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/login',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@login',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@login',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'login',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::TKK8Fpr8ZNTdmTAT' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'POST',
        2 => 'HEAD',
      ),
      'uri' => 'api/auth/google',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@google',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@google',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::TKK8Fpr8ZNTdmTAT',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4b0Fg2hRc2i5OkA1' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'POST',
        2 => 'HEAD',
      ),
      'uri' => 'api/auth/facebook',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@facebook',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@facebook',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::4b0Fg2hRc2i5OkA1',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::dyys9vpyq8tkV4kO' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/register-otp',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthOtpController@register',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthOtpController@register',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::dyys9vpyq8tkV4kO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Xokl9Xi1AOLgP961' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/verify-otp',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthOtpController@verifyOtp',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthOtpController@verifyOtp',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::Xokl9Xi1AOLgP961',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1IwNnVGXlDPt3myl' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/resend-otp',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthOtpController@resendOtp',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthOtpController@resendOtp',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::1IwNnVGXlDPt3myl',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Mz8E4edMQwCyzCxF' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/auth/check-otp-status',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthOtpController@checkStatus',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthOtpController@checkStatus',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::Mz8E4edMQwCyzCxF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::BlnKAEDawlMg8anO' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/auth/login',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\AdminIpRestriction',
          2 => 'App\\Http\\Middleware\\AdminRateLimiter',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@login',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@login',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::BlnKAEDawlMg8anO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::c8fINAAFhKEFUfN9' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/auth/logout',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@logout',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@logout',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::c8fINAAFhKEFUfN9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Y6JpHEJFzPb0jKKx' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/auth/me',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@me',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@me',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::Y6JpHEJFzPb0jKKx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::88g1SoEAVfDD49xQ' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/auth/refresh',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@refresh',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@refresh',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::88g1SoEAVfDD49xQ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::I1nZNDqp7s6AuIlX' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/auth/activity-logs',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@activityLogs',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@activityLogs',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::I1nZNDqp7s6AuIlX',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::aOPYtSqNzLtdcAaO' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/auth/suspicious-activity',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@suspiciousActivity',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@suspiciousActivity',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::aOPYtSqNzLtdcAaO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PqnaUV02aT3njZwZ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/dashboard',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@dashboard',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@dashboard',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::PqnaUV02aT3njZwZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::svDZSGsq29CyA3q3' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/notifications',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@notifications',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@notifications',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::svDZSGsq29CyA3q3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KtlJNYnXSoSsXQkF' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/notifications/{id}/read',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@markNotificationRead',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@markNotificationRead',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::KtlJNYnXSoSsXQkF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Ff9HyxBereaIKiCu' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/ads',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@ads',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@ads',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::Ff9HyxBereaIKiCu',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::EpA14nsHjs2L8hnC' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/ads/flagged',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@flaggedAds',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@flaggedAds',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::EpA14nsHjs2L8hnC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::iwX21RvYXEqEi7B0' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/ad/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@getAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@getAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::iwX21RvYXEqEi7B0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::HyvRNByy73AprH0H' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/ad/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@updateAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@updateAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::HyvRNByy73AprH0H',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Su3tPD0FTsF6XtQ5' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/{id}/approve',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@approveAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@approveAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::Su3tPD0FTsF6XtQ5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::o0CvV2lDXZr0uGnz' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/{id}/reject',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@rejectAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@rejectAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::o0CvV2lDXZr0uGnz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mAtu5mSw19xrQukh' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/{id}/verify',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@verifyAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@verifyAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::mAtu5mSw19xrQukh',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::hg9h6PzKUGXfgZ2z' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/{id}/feature',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@featureAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@featureAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::hg9h6PzKUGXfgZ2z',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IJucjommkDU23sKK' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/{id}/promote',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@promoteAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@promoteAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::IJucjommkDU23sKK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IxdqkFnMNzT27KGE' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/{id}/reprocess',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@reprocessAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@reprocessAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::IxdqkFnMNzT27KGE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::j22GvT6lKLbL7MPO' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/secure-control-9ja/ads/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@deleteAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@deleteAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::j22GvT6lKLbL7MPO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::rccTr5M88alV9hxz' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/bulk-delete',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@bulkDeleteAds',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@bulkDeleteAds',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::rccTr5M88alV9hxz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ifGJHRnldjkZ2OO3' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ad/{id}/images',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@uploadImages',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@uploadImages',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::ifGJHRnldjkZ2OO3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0wppu9dOXTXsQMfE' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/ad/{id}/images/order',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@updateImageOrder',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@updateImageOrder',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::0wppu9dOXTXsQMfE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::8bhkAlAJA8t0ASHO' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/secure-control-9ja/ad/{id}/image/{imageId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@deleteImage',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@deleteImage',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::8bhkAlAJA8t0ASHO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::glluMxM0qJDGhpxy' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/ads/moderation',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@index',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::glluMxM0qJDGhpxy',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::oog1pP1cV1VyLBmg' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/ads/moderation/stats',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@stats',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@stats',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::oog1pP1cV1VyLBmg',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::rDNQnyBIzxVCBjCA' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/moderation/analyze',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@analyzeAll',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@analyzeAll',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::rDNQnyBIzxVCBjCA',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::dvJYYtyV3XuvqGrR' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/moderation/fix-all',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@fixAllFlagged',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@fixAllFlagged',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::dvJYYtyV3XuvqGrR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::QCs1WFOYFiKV7FVK' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/moderation/bulk-fix',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@fixBulk',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@fixBulk',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::QCs1WFOYFiKV7FVK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::2xa1WsHJG64AyTTA' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/ads/moderation/logs',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@logs',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@logs',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::2xa1WsHJG64AyTTA',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KBeM2yCap7EboN5G' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/ads-moderation/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@analyze',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@analyze',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::KBeM2yCap7EboN5G',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::LrXS4VyRxVDmCDQG' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads-moderation/{id}/fix',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@fix',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@fix',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::LrXS4VyRxVDmCDQG',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Oh7q1Fxfkr30dAbE' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/{id}/delete-images',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@deleteImages',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@deleteImages',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::Oh7q1Fxfkr30dAbE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PYJkWHnfazwjVF91' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/ads/{id}/replace-images',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdModerationController@replaceImages',
        'controller' => 'App\\Http\\Controllers\\Api\\AdModerationController@replaceImages',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::PYJkWHnfazwjVF91',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::8R9WtTBnpDLcoZnX' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/users',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@users',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@users',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::8R9WtTBnpDLcoZnX',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::SL46PdNSCCuoc0DT' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/users/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@updateUser',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@updateUser',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::SL46PdNSCCuoc0DT',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::LZJ2zDtQPRAcpB3k' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/secure-control-9ja/users/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@deleteUser',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@deleteUser',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::LZJ2zDtQPRAcpB3k',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::LNbQ5xObNlMRJ2RO' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/users/{id}/suspend',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@suspendUser',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@suspendUser',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::LNbQ5xObNlMRJ2RO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::l0PGoMXk9cfHQw64' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/users/{id}/ban',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@banUser',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@banUser',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::l0PGoMXk9cfHQw64',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::NG06zIljuhB6k9wb' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/users/{id}/activate',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@activateUser',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@activateUser',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::NG06zIljuhB6k9wb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::hV179HXChmikonhZ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/categories',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@categories',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@categories',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::hV179HXChmikonhZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::iN21CZbyVTQc2W43' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/categories',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@createCategory',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@createCategory',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::iN21CZbyVTQc2W43',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::08abMSBmZHpoFsTD' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/categories/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@updateCategory',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@updateCategory',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::08abMSBmZHpoFsTD',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::nJpbJBJyHNnEJH7L' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/secure-control-9ja/categories/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@deleteCategory',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@deleteCategory',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::nJpbJBJyHNnEJH7L',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::EdUV9eIOWVY3W6Wb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/locations',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@locations',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@locations',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::EdUV9eIOWVY3W6Wb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::iKeiyzaMGfkWUp2c' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/locations',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@createLocation',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@createLocation',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::iKeiyzaMGfkWUp2c',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::bZeTS1unGklVditG' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/locations/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@updateLocation',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@updateLocation',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::bZeTS1unGklVditG',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::nbt6jOfacWel8hJC' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/secure-control-9ja/locations/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@deleteLocation',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@deleteLocation',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::nbt6jOfacWel8hJC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::6hqxQ2MmydweXrrm' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/reports',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@reports',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@reports',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::6hqxQ2MmydweXrrm',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::3Z9jc0paAi4vOKtT' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/reports/{id}/resolve',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@resolveReport',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@resolveReport',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::3Z9jc0paAi4vOKtT',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::e4sQ2pN9PTJ4SEdp' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/analytics',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@analytics',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@analytics',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::e4sQ2pN9PTJ4SEdp',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Pq2xnUeuMqQfjZ1e' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/analytics/states',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@statesAnalytics',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@statesAnalytics',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::Pq2xnUeuMqQfjZ1e',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::8nj3CYmobI7AhdDZ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/messages',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@messages',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@messages',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::8nj3CYmobI7AhdDZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::SWUGJ9tTZkDcSfyh' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/broadcasts',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\BroadcastController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\BroadcastController@index',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::SWUGJ9tTZkDcSfyh',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::fJZ34hUdJqM1CtgC' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/broadcast',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@broadcast',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@broadcast',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::fJZ34hUdJqM1CtgC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::LoEcVhDuh0jvEHDI' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/settings',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@settings',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@settings',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::LoEcVhDuh0jvEHDI',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mBqjAr02EHXqcCS8' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/settings',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@updateSettings',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@updateSettings',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::mBqjAr02EHXqcCS8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Xw4U2HlWd7ulXbUw' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/watermark',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\WatermarkController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\WatermarkController@index',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::Xw4U2HlWd7ulXbUw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::12fCl1T0BMhgZa0D' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/watermark',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\WatermarkController@update',
        'controller' => 'App\\Http\\Controllers\\Api\\WatermarkController@update',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::12fCl1T0BMhgZa0D',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::XyD8JDDEH5OT2RCU' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/watermark/logo',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\WatermarkController@uploadLogo',
        'controller' => 'App\\Http\\Controllers\\Api\\WatermarkController@uploadLogo',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::XyD8JDDEH5OT2RCU',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1xDKrcgR71LZV9CW' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/fonts',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FontController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\FontController@index',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::1xDKrcgR71LZV9CW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1hPF6aUfYhABr9EC' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/fonts',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FontController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\FontController@store',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::1hPF6aUfYhABr9EC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::T8UBzSPGo135IGki' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/secure-control-9ja/fonts/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FontController@destroy',
        'controller' => 'App\\Http\\Controllers\\Api\\FontController@destroy',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::T8UBzSPGo135IGki',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ojsqCrP4PiXCDESm' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/fonts/{id}/default',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FontController@setDefault',
        'controller' => 'App\\Http\\Controllers\\Api\\FontController@setDefault',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::ojsqCrP4PiXCDESm',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::22Ywui2yZyDwKk9p' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/bank-transfers',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@bankTransfers',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@bankTransfers',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::22Ywui2yZyDwKk9p',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::K5KUOEBDmJnznlui' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/bank-transfers/stats',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@getBankTransferStats',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@getBankTransferStats',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::K5KUOEBDmJnznlui',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::30eNUcJlw0YotDUx' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/bank-transfers/{id}/approve',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@approveBankTransfer',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@approveBankTransfer',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::30eNUcJlw0YotDUx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IQAPjxPWJbniRzBG' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/bank-transfers/{id}/reject',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@rejectBankTransfer',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@rejectBankTransfer',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::IQAPjxPWJbniRzBG',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Cp2YOZteylZX8hFd' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/banners',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\BannerController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\BannerController@index',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::Cp2YOZteylZX8hFd',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::XLGybwEkhZHB9Z2m' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/banners',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\BannerController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\BannerController@store',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::XLGybwEkhZHB9Z2m',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::oxOjFUKu28GlTPJt' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/banners/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\BannerController@update',
        'controller' => 'App\\Http\\Controllers\\Api\\BannerController@update',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::oxOjFUKu28GlTPJt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::DULm2LUScZpS5IrQ' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/secure-control-9ja/banners/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\BannerController@destroy',
        'controller' => 'App\\Http\\Controllers\\Api\\BannerController@destroy',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::DULm2LUScZpS5IrQ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::t9XpBB0vcjniex8z' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/banners/reorder',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\BannerController@reorder',
        'controller' => 'App\\Http\\Controllers\\Api\\BannerController@reorder',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::t9XpBB0vcjniex8z',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::eoKg5BksJy6Bb4KW' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/social/post-ad',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialPostController@postAd',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialPostController@postAd',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::eoKg5BksJy6Bb4KW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::oUQewEpFZDIq5cwy' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/social/post-ads-batch',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialPostController@postAdsBatch',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialPostController@postAdsBatch',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::oUQewEpFZDIq5cwy',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::jlit8pd0pufo2ctZ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/social/posts',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialPostController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialPostController@index',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::jlit8pd0pufo2ctZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::wwHDDM0d8jyzNzC7' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/social/scheduled',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialPostController@scheduled',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialPostController@scheduled',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::wwHDDM0d8jyzNzC7',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::F88eAa8ccvJstHoI' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/social/retry/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialPostController@retry',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialPostController@retry',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::F88eAa8ccvJstHoI',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ZjO6Uns6QDhDC2tt' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/social/cancel/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialPostController@cancel',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialPostController@cancel',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::ZjO6Uns6QDhDC2tt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::LADt8KFR2WhMuJv7' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/social/stats',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialPostController@stats',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialPostController@stats',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::LADt8KFR2WhMuJv7',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::dNdXDjd1KcDU1InM' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/social/settings',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialSettingsController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialSettingsController@index',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::dNdXDjd1KcDU1InM',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GYX7xMLz6SO43MHc' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/social/settings',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialSettingsController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialSettingsController@store',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::GYX7xMLz6SO43MHc',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::vu8AjezaLf3XRueU' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/social/settings/test',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialSettingsController@test',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialSettingsController@test',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::vu8AjezaLf3XRueU',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::AAJOB98bJtO3byDe' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/secure-control-9ja/social/settings/{platform}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SocialSettingsController@destroy',
        'controller' => 'App\\Http\\Controllers\\Api\\SocialSettingsController@destroy',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::AAJOB98bJtO3byDe',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9NXPCKnnddXVS8cP' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/payments',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@payments',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@payments',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::9NXPCKnnddXVS8cP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::T0UUV6oFFvcZRR4U' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/payments/summary',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@paymentSummary',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@paymentSummary',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::T0UUV6oFFvcZRR4U',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::UpapmN7EfdGVvaUt' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/boosts',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@boosts',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@boosts',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::UpapmN7EfdGVvaUt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::v1mmsC89zZs7Ydfd' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/boosts/active-ads',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@adsWithBoosts',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@adsWithBoosts',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::v1mmsC89zZs7Ydfd',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1bYJXxRQsyWnpcnd' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/boosts/{id}/deactivate',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@deactivateBoost',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@deactivateBoost',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::1bYJXxRQsyWnpcnd',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::YjVTAFrhdLa6VmJN' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/boosts/{id}/extend',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminController@extendBoost',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminController@extendBoost',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::YjVTAFrhdLa6VmJN',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::c5UmiWUrODiPpo71' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/boost/plans',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminBoostController@plans',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminBoostController@plans',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::c5UmiWUrODiPpo71',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9P2yVP8JQBYJQxBU' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/boost/plans',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminBoostController@createPlan',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminBoostController@createPlan',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::9P2yVP8JQBYJQxBU',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::99Mcx9iMKcrlvD1h' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/secure-control-9ja/boost/plans/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminBoostController@updatePlan',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminBoostController@updatePlan',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::99Mcx9iMKcrlvD1h',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Yfiot4HSO0UQE0Mf' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/secure-control-9ja/boost/plans/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminBoostController@deletePlan',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminBoostController@deletePlan',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::Yfiot4HSO0UQE0Mf',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::oVkI74WxGpSW607V' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/boost/boosts',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminBoostController@allBoosts',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminBoostController@allBoosts',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::oVkI74WxGpSW607V',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::EC4zEtE5qfe5ZkKb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/boost/summary',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminBoostController@boostSummary',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminBoostController@boostSummary',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::EC4zEtE5qfe5ZkKb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::vjK06A5HVtG80XRw' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/boost/boosts/{id}/deactivate',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminBoostController@deactivateBoost',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminBoostController@deactivateBoost',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::vjK06A5HVtG80XRw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9DjWYZILUyCpwNRX' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/secure-control-9ja/boost/boosts/{id}/extend',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminBoostController@extendBoost',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminBoostController@extendBoost',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::9DjWYZILUyCpwNRX',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GVNtVejA7f0ItzOZ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/analytics/summary',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAnalyticsController@summary',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAnalyticsController@summary',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::GVNtVejA7f0ItzOZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tnkf4rAtbvsA9F3h' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/analytics/trends',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAnalyticsController@trends',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAnalyticsController@trends',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::tnkf4rAtbvsA9F3h',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::zkFqjxRM0bC9bMGZ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/secure-control-9ja/analytics/revenue',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAnalyticsController@revenueBreakdown',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAnalyticsController@revenueBreakdown',
        'namespace' => NULL,
        'prefix' => 'api/secure-control-9ja',
        'where' => 
        array (
        ),
        'as' => 'generated::zkFqjxRM0bC9bMGZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::SZZPfzUxV3Y4k2ES' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/admin/login',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\AdminIpRestriction',
          2 => 'App\\Http\\Middleware\\AdminRateLimiter',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@login',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@login',
        'namespace' => NULL,
        'prefix' => 'api/admin',
        'where' => 
        array (
        ),
        'as' => 'generated::SZZPfzUxV3Y4k2ES',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::11abpDvRDHN8zXN6' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/admin/logout',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@logout',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@logout',
        'namespace' => NULL,
        'prefix' => 'api/admin',
        'where' => 
        array (
        ),
        'as' => 'generated::11abpDvRDHN8zXN6',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::X0ro1Sq0AS2JBbJV' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/admin/me',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@me',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@me',
        'namespace' => NULL,
        'prefix' => 'api/admin',
        'where' => 
        array (
        ),
        'as' => 'generated::X0ro1Sq0AS2JBbJV',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::P0IfGLnWLDJdTnuB' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/admin/refresh',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@refresh',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@refresh',
        'namespace' => NULL,
        'prefix' => 'api/admin',
        'where' => 
        array (
        ),
        'as' => 'generated::P0IfGLnWLDJdTnuB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Z89hTEgzfq7k0iC8' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/admin/activity-logs',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'App\\Http\\Middleware\\SecureAdminAuth',
          2 => 'App\\Http\\Middleware\\AdminIpRestriction',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdminAuthController@activityLogs',
        'controller' => 'App\\Http\\Controllers\\Api\\AdminAuthController@activityLogs',
        'namespace' => NULL,
        'prefix' => 'api/admin',
        'where' => 
        array (
        ),
        'as' => 'generated::Z89hTEgzfq7k0iC8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::c0zPvNPf8dqeoHNx' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/logout',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@logout',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@logout',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::c0zPvNPf8dqeoHNx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::l8bn5WXuEvLZauVO' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/auth/me',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@me',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@me',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::l8bn5WXuEvLZauVO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::B9XbntrAggCEr47f' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
        1 => 'POST',
      ),
      'uri' => 'api/auth/profile',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@updateProfile',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@updateProfile',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::B9XbntrAggCEr47f',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::jcScwG3cqXXIxrum' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/profile/avatar',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@updateAvatar',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@updateAvatar',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::jcScwG3cqXXIxrum',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::eoWqNpEFaqyWrqRY' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/change-password',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@changePassword',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@changePassword',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::eoWqNpEFaqyWrqRY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0aMic4ASiDXWtezw' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/auth/delete-account',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AuthController@deleteAccount',
        'controller' => 'App\\Http\\Controllers\\Api\\AuthController@deleteAccount',
        'namespace' => NULL,
        'prefix' => 'api/auth',
        'where' => 
        array (
        ),
        'as' => 'generated::0aMic4ASiDXWtezw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ILJ0O4ckTB7LvGVY' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/categories',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'cache-response:3600',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CategoryController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\CategoryController@index',
        'namespace' => NULL,
        'prefix' => 'api/categories',
        'where' => 
        array (
        ),
        'as' => 'generated::ILJ0O4ckTB7LvGVY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::a8fVIZ0UnPiu6zGt' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/categories/all',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'cache-response:3600',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CategoryController@getAllCategories',
        'controller' => 'App\\Http\\Controllers\\Api\\CategoryController@getAllCategories',
        'namespace' => NULL,
        'prefix' => 'api/categories',
        'where' => 
        array (
        ),
        'as' => 'generated::a8fVIZ0UnPiu6zGt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::uxrTTLG1upw1TqzB' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/categories/{slug}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'cache-response:3600',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CategoryController@show',
        'controller' => 'App\\Http\\Controllers\\Api\\CategoryController@show',
        'namespace' => NULL,
        'prefix' => 'api/categories',
        'where' => 
        array (
        ),
        'as' => 'generated::uxrTTLG1upw1TqzB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::5oX8TvZTMSLFu66o' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/categories/{category}/fields',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'cache-response:3600',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@forCategory',
        'controller' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@forCategory',
        'namespace' => NULL,
        'prefix' => 'api/categories',
        'where' => 
        array (
        ),
        'as' => 'generated::5oX8TvZTMSLFu66o',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Vh3foQyQKG0yxHaj' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/category-fields',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@index',
        'namespace' => NULL,
        'prefix' => 'api/category-fields',
        'where' => 
        array (
        ),
        'as' => 'generated::Vh3foQyQKG0yxHaj',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::7vMuy034X9lqilbi' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/category-fields',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@store',
        'namespace' => NULL,
        'prefix' => 'api/category-fields',
        'where' => 
        array (
        ),
        'as' => 'generated::7vMuy034X9lqilbi',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::INw3rVyKJiW9V3Fd' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/category-fields/{field}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@update',
        'controller' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@update',
        'namespace' => NULL,
        'prefix' => 'api/category-fields',
        'where' => 
        array (
        ),
        'as' => 'generated::INw3rVyKJiW9V3Fd',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::quvjHOpz01Hx4XJA' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/category-fields/{field}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@destroy',
        'controller' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@destroy',
        'namespace' => NULL,
        'prefix' => 'api/category-fields',
        'where' => 
        array (
        ),
        'as' => 'generated::quvjHOpz01Hx4XJA',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::xIa8rCmQAkQmkdwA' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/category-fields/reorder',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@reorder',
        'controller' => 'App\\Http\\Controllers\\Api\\CategoryFieldController@reorder',
        'namespace' => NULL,
        'prefix' => 'api/category-fields',
        'where' => 
        array (
        ),
        'as' => 'generated::xIa8rCmQAkQmkdwA',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::t7WgZCRx8nxeYppn' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/locations',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'cache-response:3600',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\LocationController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\LocationController@index',
        'namespace' => NULL,
        'prefix' => 'api/locations',
        'where' => 
        array (
        ),
        'as' => 'generated::t7WgZCRx8nxeYppn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::XmymJUqGMFXTAbfH' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/locations/{slug}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'cache-response:3600',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\LocationController@show',
        'controller' => 'App\\Http\\Controllers\\Api\\LocationController@show',
        'namespace' => NULL,
        'prefix' => 'api/locations',
        'where' => 
        array (
        ),
        'as' => 'generated::XmymJUqGMFXTAbfH',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::K1iTtsXz3aP0QTaM' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/icons',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\IconController@getAll',
        'controller' => 'App\\Http\\Controllers\\Api\\IconController@getAll',
        'namespace' => NULL,
        'prefix' => 'api/icons',
        'where' => 
        array (
        ),
        'as' => 'generated::K1iTtsXz3aP0QTaM',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::vq60meVZTRcuAduT' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/icons/search',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\IconController@search',
        'controller' => 'App\\Http\\Controllers\\Api\\IconController@search',
        'namespace' => NULL,
        'prefix' => 'api/icons',
        'where' => 
        array (
        ),
        'as' => 'generated::vq60meVZTRcuAduT',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::EiB4sRe22uHMsa72' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/icons/category/{category}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\IconController@getByCategory',
        'controller' => 'App\\Http\\Controllers\\Api\\IconController@getByCategory',
        'namespace' => NULL,
        'prefix' => 'api/icons',
        'where' => 
        array (
        ),
        'as' => 'generated::EiB4sRe22uHMsa72',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0DzsSec3m3I0FUg9' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/icons/custom',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\IconController@listCustom',
        'controller' => 'App\\Http\\Controllers\\Api\\IconController@listCustom',
        'namespace' => NULL,
        'prefix' => 'api/icons',
        'where' => 
        array (
        ),
        'as' => 'generated::0DzsSec3m3I0FUg9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::YbdDit4vtDRXIfii' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/icons/upload',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\IconController@uploadCustom',
        'controller' => 'App\\Http\\Controllers\\Api\\IconController@uploadCustom',
        'namespace' => NULL,
        'prefix' => 'api/icons',
        'where' => 
        array (
        ),
        'as' => 'generated::YbdDit4vtDRXIfii',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KSoGtofUoHvNbOqo' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/icons/custom/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\IconController@deleteCustom',
        'controller' => 'App\\Http\\Controllers\\Api\\IconController@deleteCustom',
        'namespace' => NULL,
        'prefix' => 'api/icons',
        'where' => 
        array (
        ),
        'as' => 'generated::KSoGtofUoHvNbOqo',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tBOC5Nnzb7wFdnvp' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/search',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:search',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SearchController@search',
        'controller' => 'App\\Http\\Controllers\\Api\\SearchController@search',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::tBOC5Nnzb7wFdnvp',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::o0DGU3l5kn9tuVld' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/search/advanced',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:search',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SearchController@advancedSearch',
        'controller' => 'App\\Http\\Controllers\\Api\\SearchController@advancedSearch',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::o0DGU3l5kn9tuVld',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::xcs7YYSK8dZxRLHF' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/search/suggestions',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:search',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SearchController@suggestions',
        'controller' => 'App\\Http\\Controllers\\Api\\SearchController@suggestions',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::xcs7YYSK8dZxRLHF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::d9CBVjJFGH360Q8f' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/search/trending',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:search',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SearchController@trending',
        'controller' => 'App\\Http\\Controllers\\Api\\SearchController@trending',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::d9CBVjJFGH360Q8f',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::vBmOn0vNOTMWfsFR' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/search/recent',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:search',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SearchController@recentSearches',
        'controller' => 'App\\Http\\Controllers\\Api\\SearchController@recentSearches',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::vBmOn0vNOTMWfsFR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::kEhqAIQxikXwgPwb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/banners/active',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\BannerController@active',
        'controller' => 'App\\Http\\Controllers\\Api\\BannerController@active',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::kEhqAIQxikXwgPwb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::BySyy4uCie4tv2p7' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/cloudinary/config',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CloudinaryController@getConfig',
        'controller' => 'App\\Http\\Controllers\\Api\\CloudinaryController@getConfig',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::BySyy4uCie4tv2p7',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::5vQDpisKIzfD4DGL' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/cloudinary/upload-params',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CloudinaryController@getSignedUploadParams',
        'controller' => 'App\\Http\\Controllers\\Api\\CloudinaryController@getSignedUploadParams',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::5vQDpisKIzfD4DGL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::f1kRNoX3omR1vdPP' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/cloudinary/upload-callback',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CloudinaryController@uploadCallback',
        'controller' => 'App\\Http\\Controllers\\Api\\CloudinaryController@uploadCallback',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::f1kRNoX3omR1vdPP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::uPSrbmSmqsmgZDAD' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/cloudinary/validate-image',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CloudinaryController@validateImage',
        'controller' => 'App\\Http\\Controllers\\Api\\CloudinaryController@validateImage',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::uPSrbmSmqsmgZDAD',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1cqrOljLbnX7RnmI' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/homepage',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:homepage',
          2 => 'cache-response:600',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\HomepageController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\HomepageController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::1cqrOljLbnX7RnmI',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GagEn3Shp7KdCNxX' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/homepage/clear-cache',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\HomepageController@clearCache',
        'controller' => 'App\\Http\\Controllers\\Api\\HomepageController@clearCache',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::GagEn3Shp7KdCNxX',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::FkusvEXyWxZ3geU3' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@index',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::FkusvEXyWxZ3geU3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::eYxr58nZmczOsfTg' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/ranking',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
          3 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\RankingController@feed',
        'controller' => 'App\\Http\\Controllers\\Api\\RankingController@feed',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::eYxr58nZmczOsfTg',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::h71UQvlRn2bpxvuR' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/featured',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@featured',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@featured',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::h71UQvlRn2bpxvuR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::eLOaVYDN2WSeB8yo' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/recent',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@recent',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@recent',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::eLOaVYDN2WSeB8yo',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::H2LLqgRj4WrDJWvs' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/similar',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@similarAds',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@similarAds',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::H2LLqgRj4WrDJWvs',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tVF52IVHFIpsRmbZ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/boost-prices',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@getBoostPrices',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@getBoostPrices',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::tVF52IVHFIpsRmbZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::K0g3NKHwuNMDQPcr' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/boost-plans',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@getBoostPlans',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@getBoostPlans',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::K0g3NKHwuNMDQPcr',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::f0XlJK7tnvJXMxGY' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads/{id}/track-click',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@trackClick',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@trackClick',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::f0XlJK7tnvJXMxGY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::MAhO5QYUChq7fJRY' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/{id}/share-link',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@getShareLink',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@getShareLink',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::MAhO5QYUChq7fJRY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::2IhvkeMsnaaTliHM' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/{slug}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'throttle:public-api',
          2 => 'cache-response:300',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@show',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@show',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::2IhvkeMsnaaTliHM',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
        'slug' => '^(?=.*[a-z])[a-z0-9\\-]+$',
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::BRkmwZXNOuSPokL2' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/sellers/{sellerId}/reviews',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@index',
        'namespace' => NULL,
        'prefix' => 'api/sellers',
        'where' => 
        array (
        ),
        'as' => 'generated::BRkmwZXNOuSPokL2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0UkFgRQnuxpiOVOB' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/sellers/{sellerId}/reviews/latest',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@latestReviews',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@latestReviews',
        'namespace' => NULL,
        'prefix' => 'api/sellers',
        'where' => 
        array (
        ),
        'as' => 'generated::0UkFgRQnuxpiOVOB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tNgcosdmcqATMdGY' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/sellers/{sellerId}/rating',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@ratingSummary',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@ratingSummary',
        'namespace' => NULL,
        'prefix' => 'api/sellers',
        'where' => 
        array (
        ),
        'as' => 'generated::tNgcosdmcqATMdGY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::rqCwQJmc34AivYBM' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/sellers/{sellerId}/profile',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@sellerProfile',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@sellerProfile',
        'namespace' => NULL,
        'prefix' => 'api/sellers',
        'where' => 
        array (
        ),
        'as' => 'generated::rqCwQJmc34AivYBM',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::VF3urJyDj2d2sN88' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/{adId}/reviews',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@adReviews',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@adReviews',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::VF3urJyDj2d2sN88',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::QIoaUZAxAxGcM4eC' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/{adId}/reviews/summary',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@adReviewSummary',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@adReviewSummary',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::QIoaUZAxAxGcM4eC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::6Ey87rBJVwG0078U' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/{adId}/reviews/latest',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@adLatestReviews',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@adLatestReviews',
        'namespace' => NULL,
        'prefix' => 'api/ads',
        'where' => 
        array (
        ),
        'as' => 'generated::6Ey87rBJVwG0078U',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::jhKFHvH1GWGgpFRe' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/reports',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReportController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\ReportController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::jhKFHvH1GWGgpFRe',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tyfYRcoyzTehGEQw' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
          2 => 'throttle:post-ad',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::tyfYRcoyzTehGEQw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::WjA8Y8ERwP7FOKHc' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads/boost-on-publish',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
          2 => 'throttle:post-ad',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@boostOnPublish',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@boostOnPublish',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::WjA8Y8ERwP7FOKHc',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IhEDGdMvsxKQwDmY' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@showById',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@showById',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::IhEDGdMvsxKQwDmY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
        'id' => '[0-9]+',
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KfFS9Y5FLoQ4xMsn' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
        1 => 'PUT',
      ),
      'uri' => 'api/ads/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@updateById',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@updateById',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::KfFS9Y5FLoQ4xMsn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
        'id' => '[0-9]+',
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::8YmWBKslYil92gFq' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/ads/{slug}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@update',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::8YmWBKslYil92gFq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::VmzUyRYxoyPrHZOe' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/ads/{slug}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@destroy',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::VmzUyRYxoyPrHZOe',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::sOBqpISpp8eVtTvx' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/my-ads',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@myAds',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@myAds',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::sOBqpISpp8eVtTvx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::zn8qBRwyjzloJbeh' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads/{id}/close',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@closeAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@closeAd',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::zn8qBRwyjzloJbeh',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::cb8sGIEX058hU90u' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads/{id}/renew',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdController@renewAd',
        'controller' => 'App\\Http\\Controllers\\Api\\AdController@renewAd',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::cb8sGIEX058hU90u',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ExbbJKzwA8PzBGyT' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads/{adId}/images',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdImageController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\AdImageController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::ExbbJKzwA8PzBGyT',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KkiIfH3B8Y90Zz3K' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/ads/{adId}/images/{imageId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdImageController@update',
        'controller' => 'App\\Http\\Controllers\\Api\\AdImageController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::KkiIfH3B8Y90Zz3K',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::sROAG47vgNSiOmcv' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/ads/{adId}/images/{imageId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\AdImageController@destroy',
        'controller' => 'App\\Http\\Controllers\\Api\\AdImageController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::sROAG47vgNSiOmcv',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::U7wrHvdEdBZDqfzp' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/my-boosts',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@myBoosts',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@myBoosts',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::U7wrHvdEdBZDqfzp',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0b3GlZjox3Igk7q0' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads/{id}/boost',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
          2 => 'throttle:boost',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@boostAd',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@boostAd',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::0b3GlZjox3Igk7q0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0yMwiISToPbpeLBp' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/{id}/boost-status',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@getBoostStatus',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@getBoostStatus',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::0yMwiISToPbpeLBp',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::g2xKhMyiSSuvoe44' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads/{id}/boost-renew',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
          2 => 'throttle:boost',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@renewBoost',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@renewBoost',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::g2xKhMyiSSuvoe44',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ghZJO665vxJOZthm' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/{id}/boost-renewal-check',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@checkRenewal',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@checkRenewal',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::ghZJO665vxJOZthm',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::b4zqMkDS19Q1H8nt' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads/{id}/save',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@saveAd',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@saveAd',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::b4zqMkDS19Q1H8nt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::HpdHTengWWqWQrJB' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/ads/{id}/unsave',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@unsaveAd',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@unsaveAd',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::HpdHTengWWqWQrJB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::UCFTnlsAYM7yJVjP' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/ads/{id}/saved-check',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@checkSavedStatus',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@checkSavedStatus',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::UCFTnlsAYM7yJVjP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Cc926C5HBxE9Z9dj' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/user/saved-ads',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@getSavedAds',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@getSavedAds',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Cc926C5HBxE9Z9dj',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::g8PN9nVofUNglcIW' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/user/recently-viewed',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@getRecentlyViewed',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@getRecentlyViewed',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::g8PN9nVofUNglcIW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::In6UEdkJz2BLgb62' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/user/recently-viewed',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\GrowthController@clearRecentlyViewed',
        'controller' => 'App\\Http\\Controllers\\Api\\GrowthController@clearRecentlyViewed',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::In6UEdkJz2BLgb62',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gzxao8qAA6BMIyfQ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/notifications',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\NotificationController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\NotificationController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::gzxao8qAA6BMIyfQ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::oecjeHeGFBLi7vEJ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/notifications/unread',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\NotificationController@unread',
        'controller' => 'App\\Http\\Controllers\\Api\\NotificationController@unread',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::oecjeHeGFBLi7vEJ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gmBOfvHcleAb2UVb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/notifications/unread-count',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\NotificationController@unreadCount',
        'controller' => 'App\\Http\\Controllers\\Api\\NotificationController@unreadCount',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::gmBOfvHcleAb2UVb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::aMmvRsfTRIdYxPlZ' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/notifications/{id}/read',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\NotificationController@markAsRead',
        'controller' => 'App\\Http\\Controllers\\Api\\NotificationController@markAsRead',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::aMmvRsfTRIdYxPlZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KUBcUigzReUNIjTg' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/notifications/mark-all-read',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\NotificationController@markAllAsRead',
        'controller' => 'App\\Http\\Controllers\\Api\\NotificationController@markAllAsRead',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::KUBcUigzReUNIjTg',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1WYDSNUzVAzovOiq' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/notifications/{id}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\NotificationController@destroy',
        'controller' => 'App\\Http\\Controllers\\Api\\NotificationController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::1WYDSNUzVAzovOiq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::FHFNDqDtaJtNAC5r' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/notifications/delete-all',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\NotificationController@deleteAll',
        'controller' => 'App\\Http\\Controllers\\Api\\NotificationController@deleteAll',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::FHFNDqDtaJtNAC5r',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::d2xcTuohRVhhtBON' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/favorites',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FavoriteController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\FavoriteController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::d2xcTuohRVhhtBON',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::davzWgjisr45Tm67' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/favorites',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FavoriteController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\FavoriteController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::davzWgjisr45Tm67',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::BCUzDNr3vW1lQ8Fm' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/favorites/{adId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FavoriteController@destroy',
        'controller' => 'App\\Http\\Controllers\\Api\\FavoriteController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::BCUzDNr3vW1lQ8Fm',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::VqXAhmv9nzBXDzkV' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/favorites/check/{adId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FavoriteController@check',
        'controller' => 'App\\Http\\Controllers\\Api\\FavoriteController@check',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::VqXAhmv9nzBXDzkV',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::sZVGjkjDZC7KHdm9' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/messages/conversations',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\MessageController@conversations',
        'controller' => 'App\\Http\\Controllers\\Api\\MessageController@conversations',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::sZVGjkjDZC7KHdm9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::v1uI3QTCtIdmqYSZ' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/messages/conversation/get-or-create',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\MessageController@getOrCreateConversation',
        'controller' => 'App\\Http\\Controllers\\Api\\MessageController@getOrCreateConversation',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::v1uI3QTCtIdmqYSZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::uG8HI5mYacpUJ5U1' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/messages/{conversationId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\MessageController@messages',
        'controller' => 'App\\Http\\Controllers\\Api\\MessageController@messages',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::uG8HI5mYacpUJ5U1',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::6zD7N4UcBAtpOVaJ' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/messages',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
          2 => 'throttle:messages',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\MessageController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\MessageController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::6zD7N4UcBAtpOVaJ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::foBrPVhJnj2Pwhia' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/messages/{conversationId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
          2 => 'throttle:messages',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\MessageController@sendMessage',
        'controller' => 'App\\Http\\Controllers\\Api\\MessageController@sendMessage',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::foBrPVhJnj2Pwhia',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Ukd9LK19N2nWnKm0' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/messages/start',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
          2 => 'throttle:messages',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\MessageController@startConversation',
        'controller' => 'App\\Http\\Controllers\\Api\\MessageController@startConversation',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Ukd9LK19N2nWnKm0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IfTuS1iO7mpcJiP2' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/messages/{conversationId}/read',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\MessageController@markAsRead',
        'controller' => 'App\\Http\\Controllers\\Api\\MessageController@markAsRead',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::IfTuS1iO7mpcJiP2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GdxnArSTaJ7K253Y' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/messages/message/{messageId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\MessageController@deleteMessage',
        'controller' => 'App\\Http\\Controllers\\Api\\MessageController@deleteMessage',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::GdxnArSTaJ7K253Y',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Mlume7JJVIzCvLKn' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/follow',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FollowController@follow',
        'controller' => 'App\\Http\\Controllers\\Api\\FollowController@follow',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Mlume7JJVIzCvLKn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::OW4SdBbW6IYDn6xz' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/unfollow',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FollowController@unfollow',
        'controller' => 'App\\Http\\Controllers\\Api\\FollowController@unfollow',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::OW4SdBbW6IYDn6xz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::QllyM3jlUKdWdPOl' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/follow/check',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FollowController@checkFollow',
        'controller' => 'App\\Http\\Controllers\\Api\\FollowController@checkFollow',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::QllyM3jlUKdWdPOl',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ct8EokHS0nZuXFui' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/users/{userId}/followers',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FollowController@followers',
        'controller' => 'App\\Http\\Controllers\\Api\\FollowController@followers',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::ct8EokHS0nZuXFui',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::d1QP7D4OiF3Iohmr' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/users/{userId}/following',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FollowController@following',
        'controller' => 'App\\Http\\Controllers\\Api\\FollowController@following',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::d1QP7D4OiF3Iohmr',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Uq0AiNiCH7E9onFR' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/users/{userId}/stats',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FollowController@userStats',
        'controller' => 'App\\Http\\Controllers\\Api\\FollowController@userStats',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::Uq0AiNiCH7E9onFR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::kBgLGkvmth9fyrBI' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/feed/following',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FollowController@followingFeed',
        'controller' => 'App\\Http\\Controllers\\Api\\FollowController@followingFeed',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::kBgLGkvmth9fyrBI',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::r9khyQHyHn4jcWUb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/sellers/suggested',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\FollowController@suggestedSellers',
        'controller' => 'App\\Http\\Controllers\\Api\\FollowController@suggestedSellers',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::r9khyQHyHn4jcWUb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1DoMbyJdtlpmzUQ3' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reviews/my-reviews',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@myReviews',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@myReviews',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::1DoMbyJdtlpmzUQ3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9oe5qddsezsIpr67' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/reviews/user/{userId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@userReviews',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@userReviews',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::9oe5qddsezsIpr67',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::D1zojseXLnQk5zC9' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/reviews',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::D1zojseXLnQk5zC9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qwcga76IC9YLCFeS' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/ads/{adId}/reviews',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@storeAdReview',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@storeAdReview',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::qwcga76IC9YLCFeS',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ArcTWjyXtECL0hbx' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/reviews/{reviewId}/helpful',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@markHelpful',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@markHelpful',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::ArcTWjyXtECL0hbx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::slzLbnD1D38LV46a' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/reviews/{reviewId}/report',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@reportReview',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@reportReview',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::slzLbnD1D38LV46a',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9lybkKuXzzUcnuLc' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/reviews/{reviewId}/like',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@likeReview',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@likeReview',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::9lybkKuXzzUcnuLc',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::sduJLVojxOo8AZEp' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/reviews/{reviewId}/like',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReviewController@unlikeReview',
        'controller' => 'App\\Http\\Controllers\\Api\\ReviewController@unlikeReview',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::sduJLVojxOo8AZEp',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::bNqksprmJU2mEU4n' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/sellers/{sellerId}/can-review',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@canReview',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@canReview',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::bNqksprmJU2mEU4n',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::WJ33mAPaaPzEyLzb' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/sellers/{sellerId}/my-review',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@userReview',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@userReview',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::WJ33mAPaaPzEyLzb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ICOIXhVuPsTvD1U2' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/sellers/{sellerId}/reviews',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@store',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@store',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::ICOIXhVuPsTvD1U2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::NHwCvXMPU8ojrfIU' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'api/seller-reviews/{reviewId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@update',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@update',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::NHwCvXMPU8ojrfIU',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gIfHsxrGqHrTQUXC' => 
    array (
      'methods' => 
      array (
        0 => 'DELETE',
      ),
      'uri' => 'api/seller-reviews/{reviewId}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@destroy',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@destroy',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::gIfHsxrGqHrTQUXC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::YzGOcKsXDzp71uir' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/seller-reviews/{reviewId}/helpful',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@markHelpful',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@markHelpful',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::YzGOcKsXDzp71uir',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::APzfw1xPmXSmqSvG' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/seller-reviews/{reviewId}/report',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\SellerReviewController@reportReview',
        'controller' => 'App\\Http\\Controllers\\Api\\SellerReviewController@reportReview',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::APzfw1xPmXSmqSvG',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::d8HtxNgDx4Gbqkql' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/wallet',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\WalletController@index',
        'controller' => 'App\\Http\\Controllers\\Api\\WalletController@index',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::d8HtxNgDx4Gbqkql',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4SRe4Tev67P6aeIn' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/wallet/balance',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\WalletController@balance',
        'controller' => 'App\\Http\\Controllers\\Api\\WalletController@balance',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::4SRe4Tev67P6aeIn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::YnKV3oDA7UF054wJ' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/wallet/fund',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\WalletController@fund',
        'controller' => 'App\\Http\\Controllers\\Api\\WalletController@fund',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::YnKV3oDA7UF054wJ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::O9dSrX9tHzwN7vh4' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/wallet/verify',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\WalletController@verify',
        'controller' => 'App\\Http\\Controllers\\Api\\WalletController@verify',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::O9dSrX9tHzwN7vh4',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::YNZZEFelzKqheZGi' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/wallet/check-balance',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\WalletController@checkBalance',
        'controller' => 'App\\Http\\Controllers\\Api\\WalletController@checkBalance',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::YNZZEFelzKqheZGi',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::v3RBq44QV8ofT2Ho' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/wallet/bank-transfer-proof',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\WalletController@bankTransferProof',
        'controller' => 'App\\Http\\Controllers\\Api\\WalletController@bankTransferProof',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::v3RBq44QV8ofT2Ho',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::YSY49ZopVGsrUnVB' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/referral/my-code',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReferralController@myCode',
        'controller' => 'App\\Http\\Controllers\\Api\\ReferralController@myCode',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::YSY49ZopVGsrUnVB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::NIgv55Fi77NaPfDN' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/referral/my-referrals',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReferralController@myReferrals',
        'controller' => 'App\\Http\\Controllers\\Api\\ReferralController@myReferrals',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::NIgv55Fi77NaPfDN',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::L7cwBAU564dJWgYL' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/referral/referred-by-me',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReferralController@referredByMe',
        'controller' => 'App\\Http\\Controllers\\Api\\ReferralController@referredByMe',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::L7cwBAU564dJWgYL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::AkQp5kXrocTeTpMs' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/referral/stats',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReferralController@stats',
        'controller' => 'App\\Http\\Controllers\\Api\\ReferralController@stats',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::AkQp5kXrocTeTpMs',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mHWuQkAnjH2l1eJ1' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/referral/leaderboard',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReferralController@leaderboard',
        'controller' => 'App\\Http\\Controllers\\Api\\ReferralController@leaderboard',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::mHWuQkAnjH2l1eJ1',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gQd2KbrVsdYUODO9' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/referral/apply',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReferralController@apply',
        'controller' => 'App\\Http\\Controllers\\Api\\ReferralController@apply',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::gQd2KbrVsdYUODO9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::OdPiN1wIUC0W25Ys' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/referral/reward',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReferralController@reward',
        'controller' => 'App\\Http\\Controllers\\Api\\ReferralController@reward',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::OdPiN1wIUC0W25Ys',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::kUgAMJEiK2x4x381' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/referral/validate',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\ReferralController@validateCode',
        'controller' => 'App\\Http\\Controllers\\Api\\ReferralController@validateCode',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::kUgAMJEiK2x4x381',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::wp1OCCPbxhDOTakK' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/credits/balance',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CreditController@balance',
        'controller' => 'App\\Http\\Controllers\\Api\\CreditController@balance',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::wp1OCCPbxhDOTakK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::lMGE6GYZTyETn0qj' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/credits/history',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CreditController@history',
        'controller' => 'App\\Http\\Controllers\\Api\\CreditController@history',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::lMGE6GYZTyETn0qj',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::RmIDAuMuRsUy7qNE' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/credits/features',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CreditController@features',
        'controller' => 'App\\Http\\Controllers\\Api\\CreditController@features',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::RmIDAuMuRsUy7qNE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::B5ECOkSgNQBYHAJg' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/credits/use',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CreditController@use',
        'controller' => 'App\\Http\\Controllers\\Api\\CreditController@use',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::B5ECOkSgNQBYHAJg',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ZqX1cM1H7SP5RXkg' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/credits/check-balance',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
          1 => 'auth.api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\CreditController@checkBalance',
        'controller' => 'App\\Http\\Controllers\\Api\\CreditController@checkBalance',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::ZqX1cM1H7SP5RXkg',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::y4493Jp5Ni5p2O4j' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/webhooks/paystack',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\PaymentWebhookController@handlePaystackWebhook',
        'controller' => 'App\\Http\\Controllers\\Api\\PaymentWebhookController@handlePaystackWebhook',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::y4493Jp5Ni5p2O4j',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::C9Ql8PmKGexm2wud' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/payments/verify',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\PaymentVerificationController@verify',
        'controller' => 'App\\Http\\Controllers\\Api\\PaymentVerificationController@verify',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::C9Ql8PmKGexm2wud',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::zmZx0wVOSxkbqSOq' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/payments/status/{reference}',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'App\\Http\\Controllers\\Api\\PaymentVerificationController@status',
        'controller' => 'App\\Http\\Controllers\\Api\\PaymentVerificationController@status',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::zmZx0wVOSxkbqSOq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'payments.callback' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/payments/callback',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:55:"Laravel\\SerializableClosure\\UnsignedSerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:104:"function () {
    return \\response()->json([\'message\' => \'Payment processed. Check your dashboard.\']);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000004730000000000000000";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'payments.callback',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::h9LNPk64FSTeBcbt' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'api/test',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:55:"Laravel\\SerializableClosure\\UnsignedSerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:98:"function () {
    return \\response()->json([\'success\' => true, \'message\' => \'API is working!\']);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000004750000000000000000";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::h9LNPk64FSTeBcbt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::DrkxcShWdJ2sVCJy' => 
    array (
      'methods' => 
      array (
        0 => 'POST',
      ),
      'uri' => 'api/test',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'api',
        ),
        'uses' => 'O:55:"Laravel\\SerializableClosure\\UnsignedSerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:94:"function () {
    return \\response()->json([\'success\' => true, \'message\' => \'POST works!\']);
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000004770000000000000000";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::DrkxcShWdJ2sVCJy',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::BC9dEKqeAUqDw42n' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'up',
      'action' => 
      array (
        'uses' => 'O:55:"Laravel\\SerializableClosure\\UnsignedSerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:860:"function () {
                    $exception = null;

                    try {
                        \\Illuminate\\Support\\Facades\\Event::dispatch(new \\Illuminate\\Foundation\\Events\\DiagnosingHealth);
                    } catch (\\Throwable $e) {
                        if (app()->hasDebugModeEnabled()) {
                            throw $e;
                        }

                        report($e);

                        $exception = $e->getMessage();
                    }

                    return response(\\Illuminate\\Support\\Facades\\View::file(\'C:\\\\Users\\\\USER\\\\OneDrive\\\\Desktop\\\\Classified ads\\\\backend\\\\vendor\\\\laravel\\\\framework\\\\src\\\\Illuminate\\\\Foundation\\\\Configuration\'.\'/../resources/health-up.blade.php\', [
                        \'exception\' => $exception,
                    ]), status: $exception ? 500 : 200);
                }";s:5:"scope";s:54:"Illuminate\\Foundation\\Configuration\\ApplicationBuilder";s:4:"this";N;s:4:"self";s:32:"00000000000003720000000000000000";}}',
        'as' => 'generated::BC9dEKqeAUqDw42n',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::cgur33AShZKWb1R9' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => '/',
      'action' => 
      array (
        'middleware' => 
        array (
          0 => 'web',
        ),
        'uses' => 'O:55:"Laravel\\SerializableClosure\\UnsignedSerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:0:{}s:8:"function";s:44:"function () {
    return \\view(\'welcome\');
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000047c0000000000000000";}}',
        'namespace' => NULL,
        'prefix' => '',
        'where' => 
        array (
        ),
        'as' => 'generated::cgur33AShZKWb1R9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'storage.local' => 
    array (
      'methods' => 
      array (
        0 => 'GET',
        1 => 'HEAD',
      ),
      'uri' => 'storage/{path}',
      'action' => 
      array (
        'uses' => 'O:55:"Laravel\\SerializableClosure\\UnsignedSerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:3:{s:4:"disk";s:5:"local";s:6:"config";a:5:{s:6:"driver";s:5:"local";s:4:"root";s:73:"C:\\Users\\USER\\OneDrive\\Desktop\\Classified ads\\backend\\storage\\app/private";s:5:"serve";b:1;s:5:"throw";b:0;s:6:"report";b:0;}s:12:"isProduction";b:1;}s:8:"function";s:323:"function (\\Illuminate\\Http\\Request $request, string $path) use ($disk, $config, $isProduction) {
                    return (new \\Illuminate\\Filesystem\\ServeFile(
                        $disk,
                        $config,
                        $isProduction
                    ))($request, $path);
                }";s:5:"scope";s:47:"Illuminate\\Filesystem\\FilesystemServiceProvider";s:4:"this";N;s:4:"self";s:32:"000000000000047e0000000000000000";}}',
        'as' => 'storage.local',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
        'path' => '.*',
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'storage.local.upload' => 
    array (
      'methods' => 
      array (
        0 => 'PUT',
      ),
      'uri' => 'storage/{path}',
      'action' => 
      array (
        'uses' => 'O:55:"Laravel\\SerializableClosure\\UnsignedSerializableClosure":1:{s:12:"serializable";O:46:"Laravel\\SerializableClosure\\Serializers\\Native":5:{s:3:"use";a:3:{s:4:"disk";s:5:"local";s:6:"config";a:5:{s:6:"driver";s:5:"local";s:4:"root";s:73:"C:\\Users\\USER\\OneDrive\\Desktop\\Classified ads\\backend\\storage\\app/private";s:5:"serve";b:1;s:5:"throw";b:0;s:6:"report";b:0;}s:12:"isProduction";b:1;}s:8:"function";s:325:"function (\\Illuminate\\Http\\Request $request, string $path) use ($disk, $config, $isProduction) {
                    return (new \\Illuminate\\Filesystem\\ReceiveFile(
                        $disk,
                        $config,
                        $isProduction
                    ))($request, $path);
                }";s:5:"scope";s:47:"Illuminate\\Filesystem\\FilesystemServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000004800000000000000000";}}',
        'as' => 'storage.local.upload',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
        'path' => '.*',
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
  ),
)
);
