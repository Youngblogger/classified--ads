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
            '_route' => 'generated::goyKhysgeq6TmY66',
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
            '_route' => 'generated::nnQRwGRxZBQa3Dm9',
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
            '_route' => 'generated::FRJQ8mMk7yHiWGs5',
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
            '_route' => 'generated::KkgZi5NOXh0lntYu',
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
            '_route' => 'generated::DMEW2UpM1ims1tA9',
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
            '_route' => 'generated::UK6plsy3AUQdqZoE',
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
            '_route' => 'generated::rsttTayTLE5QPjxn',
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
            '_route' => 'generated::Yh4WBvdbBsGLjk2s',
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
            '_route' => 'generated::PLxruiVn9co4E20y',
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
            '_route' => 'generated::mNJ0exQ66faVy55i',
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
            '_route' => 'generated::qSDsQSWItIPkDnhv',
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
            '_route' => 'generated::8zY1G8gEP0xkrzNf',
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
            '_route' => 'generated::Q9oyAElk1tJmPk3N',
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
            '_route' => 'generated::t0FUoSyh50VWq5Pf',
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
            '_route' => 'generated::CFhi9zcjWAXXe8LG',
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
            '_route' => 'generated::qtVtoy4ywv95UxUC',
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
            '_route' => 'generated::f1QiHdnMlJ70G5dP',
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
            '_route' => 'generated::tei3IXZ6449pCJJU',
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
            '_route' => 'generated::gLtPpCHruqu8rPh6',
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
            '_route' => 'generated::fWJ3KNdQcnYXnNuG',
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
            '_route' => 'generated::sXWAWySPllTiKqUx',
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
            '_route' => 'generated::JtlRSk5HDbWYrJcN',
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
            '_route' => 'generated::tUYmSzTc1qK0HPVu',
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
            '_route' => 'generated::FkHr961Y947wuQcq',
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
            '_route' => 'generated::5oNjAGKZARCCIqMB',
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
            '_route' => 'generated::lGE9XLDhFs6zQI5q',
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
            '_route' => 'generated::w8GVYL5uqPzq3kuW',
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
            '_route' => 'generated::w3mvqsMgtCJM4gdW',
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
            '_route' => 'generated::WnQiJpWzPpKKNk3O',
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
            '_route' => 'generated::iTDGdtPcRK20nQX3',
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
            '_route' => 'generated::0ryV0tV19unRoFte',
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
            '_route' => 'generated::aMUv4c6ZO4gDuPQ8',
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
            '_route' => 'generated::6ZZbouHO7jLRzRA1',
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
            '_route' => 'generated::c3y8iPssJUnKooKw',
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
            '_route' => 'generated::1VTaQ5VxrVdr5Ig7',
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
            '_route' => 'generated::55W6hNMRyzKUoGk0',
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
            '_route' => 'generated::6hYB5YTwCvAV5BE5',
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
            '_route' => 'generated::UsQqL13MZHnDRt3U',
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
            '_route' => 'generated::Ot7Xxa7EjcR6I78s',
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
            '_route' => 'generated::Q9Lxpurq5fa5vW6D',
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
            '_route' => 'generated::l7P75zQdKsBkzgv1',
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
            '_route' => 'generated::uEsO2gJKW2bShuFt',
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
            '_route' => 'generated::tLsAgbabmKM60Wk2',
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
            '_route' => 'generated::qwgnll5iTIe4iCa6',
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
            '_route' => 'generated::e7QxzppFMyFWotUz',
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
            '_route' => 'generated::MB5uRljnWRqkhzr2',
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
            '_route' => 'generated::sue4lVZYnXxwCrqM',
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
            '_route' => 'generated::X4X1z90dc3RGNrrt',
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
            '_route' => 'generated::FNWAUXPdNAQBSjoa',
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
            '_route' => 'generated::GkaRwzmi8DywjLe0',
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
            '_route' => 'generated::eJc26oYZn3wTXpJu',
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
            '_route' => 'generated::bPrubk3IsRuSwx8S',
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
            '_route' => 'generated::Zl8t5b7k4poavPdn',
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
            '_route' => 'generated::GthLlFfrAUj37mUw',
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
            '_route' => 'generated::OwWsurWMdicHwiIU',
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
            '_route' => 'generated::ljqWIhGLeXNIo4QL',
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
            '_route' => 'generated::3Qws0lctWgYJdhKL',
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
            '_route' => 'generated::D7Z8kRzNa6WhukUA',
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
            '_route' => 'generated::zbgwqbZPVUdcxyC2',
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
            '_route' => 'generated::OkIviyqOyWaYzNo7',
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
            '_route' => 'generated::XwmZBXj4tkCsPXJo',
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
            '_route' => 'generated::EXVRQyTnCW4Qse8n',
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
            '_route' => 'generated::grk6Kp6dfCJy3F1e',
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
            '_route' => 'generated::4pBnTsJMH7Ig9rfC',
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
            '_route' => 'generated::K37jGjg8kkCD9JWW',
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
            '_route' => 'generated::VnZgXrOaTTBR6cf3',
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
            '_route' => 'generated::cu4UrCWhh4NbZTIQ',
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
            '_route' => 'generated::GDemmF5KapZSWQQY',
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
            '_route' => 'generated::79KVCBkRwi0Ri67r',
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
            '_route' => 'generated::WE2NYoma29JyQyu7',
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
            '_route' => 'generated::ypKIDNWASblqJ8HZ',
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
            '_route' => 'generated::bw3wh0NhlG7BvXln',
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
            '_route' => 'generated::FWuYrAcecEAObjJa',
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
            '_route' => 'generated::xfKqMTgJJ5yZI4MP',
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
            '_route' => 'generated::DXN4msVRjHfZgsgr',
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
            '_route' => 'generated::QjB9eOsX5uzd1Tdi',
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
            '_route' => 'generated::s6cNWx2jmIONP96M',
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
            '_route' => 'generated::ghxD2sGlXohx78QF',
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
            '_route' => 'generated::puGqBX6YMv4IXiKL',
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
            '_route' => 'generated::N2omDz6anOLyhpb2',
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
            '_route' => 'generated::vjSW9ZRETdhHvtb2',
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
            '_route' => 'generated::5EWUEiSwUdphx1wC',
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
            '_route' => 'generated::sBYD3cQexommGYJy',
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
            '_route' => 'generated::o4PaSi29JpLX4QJd',
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
            '_route' => 'generated::bZmiOK3pG6YIruUG',
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
            '_route' => 'generated::4WKIFO6BY9EDWA1a',
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
            '_route' => 'generated::ohuB6QJdQNbQMb99',
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
            '_route' => 'generated::YEEDn7AXwFrpJ9Uk',
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
            '_route' => 'generated::Egva8Tu0JhW2JJsN',
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
            '_route' => 'generated::MvknDXO69yLg7k1I',
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
            '_route' => 'generated::jinepGIDEJr0nnGk',
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
            '_route' => 'generated::0jB4jFHjiEQiBJVo',
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
            '_route' => 'generated::CdJ6oHFof0APC3Mz',
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
            '_route' => 'generated::eNLJr76PzcaOwYw8',
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
            '_route' => 'generated::AvQLAGDdPM5D0ZBX',
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
            '_route' => 'generated::ZUGIRqQSe7Iwvxn0',
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
            '_route' => 'generated::IHWFaTYe7FwlS5SM',
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
            '_route' => 'generated::i5h66b0kUBGGzbfI',
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
            '_route' => 'generated::hqmyYooNbnSPiuRp',
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
            '_route' => 'generated::RJMkGYrIbGW5IjJC',
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
            '_route' => 'generated::srH0fE3AVA2KTQrW',
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
            '_route' => 'generated::sbelY9HI8bjaSmOJ',
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
            '_route' => 'generated::k9mD0zgP50EKVgi7',
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
            '_route' => 'generated::1XsKHevStfzjdPgF',
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
            '_route' => 'generated::Vz1F7fOCw6zVlYDF',
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
            '_route' => 'generated::R0TEWj2fgK0P80gd',
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
            '_route' => 'generated::DFlQUi4gFugCUEpk',
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
            '_route' => 'generated::J7hQ4mW8zoHvkTrE',
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
            '_route' => 'generated::mLa9SwCsF0dy2Fy5',
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
            '_route' => 'generated::otj9v0mPpXKhFB5v',
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
            '_route' => 'generated::SHLhyOTHB9gSCFD0',
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
            '_route' => 'generated::gdmobWUz9Ig82X98',
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
            '_route' => 'generated::TkJfYGoBZCfQxwAi',
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
            '_route' => 'generated::og13O2u1hRi0Eh9H',
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
            '_route' => 'generated::1A48jhpr5mLyXkkm',
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
            '_route' => 'generated::ks4Mv7QDTKARqQes',
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
            '_route' => 'generated::MFvLBs0sntDCaq4m',
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
            '_route' => 'generated::1NesmLIVNVSsXlhr',
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
            '_route' => 'generated::KTJgnUHT5Qrn1mWX',
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
            '_route' => 'generated::GPYFYLCI9LorYDLL',
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
            '_route' => 'generated::Z6qmhSajcKOSvGT3',
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
            '_route' => 'generated::6zWI0ZGMcsjvFhDv',
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
            '_route' => 'generated::qbfUKIYVzfYLtWFb',
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
            '_route' => 'generated::OTVnMj3v5Hb4onYV',
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
            '_route' => 'generated::CeXZTb41HueOOOJq',
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
            '_route' => 'generated::wbZE2crqSJdED8r3',
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
            '_route' => 'generated::V1Yzj00X5qyrC7e0',
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
            '_route' => 'generated::OhV4pt8AEgI05civ',
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
            '_route' => 'generated::qzism3X93gWGyCU2',
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
            '_route' => 'generated::eQp1VCl9kxouspqQ',
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
            '_route' => 'generated::Qrru1dvbId2CWw2K',
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
            '_route' => 'generated::oO0R0GXhFckQDNID',
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
            '_route' => 'generated::6wI3ecKpyVsatPJ8',
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
            '_route' => 'generated::ty5vR0mcuvoJtgfi',
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
            '_route' => 'generated::ImvPkiaJ9fw3mNps',
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
            '_route' => 'generated::hBPvNLlZ408LN8DL',
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
            '_route' => 'generated::V2pNVruFX32SrHiR',
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
            '_route' => 'generated::AfsOKOxD0zvRfWRu',
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
            '_route' => 'generated::zssoB9BYxItDizg5',
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
            '_route' => 'generated::k401VgjXtYWeUBRw',
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
            '_route' => 'generated::PFW5sNhm08rU3mVz',
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
            '_route' => 'generated::dzntBMkpwlGtYoTo',
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
            '_route' => 'generated::PnIIUyDFpaYAblHI',
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
            '_route' => 'generated::Ak6mBVsduDSyqaZv',
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
            '_route' => 'generated::gvenXGQeyAbOSulx',
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
            '_route' => 'generated::GAU0H4SW0WQk5OpQ',
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
            '_route' => 'generated::QAMxZ3o1dGMggjfJ',
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
            '_route' => 'generated::MEqY0NLSNdYo1ZOR',
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
            '_route' => 'generated::m452aa7cULifFuiy',
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
            '_route' => 'generated::Cf0D2RD7VsVPPfuL',
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
            '_route' => 'generated::AGFSNIxG2lVinvDR',
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
            '_route' => 'generated::jMu74hayixpGC9vl',
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
            '_route' => 'generated::p0CQduQH1unpjjHS',
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
            '_route' => 'generated::vyzci0its7YzQXkQ',
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
            '_route' => 'generated::9Bq8f1eylcynp38U',
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
            '_route' => 'generated::gYhMqsLUILozQu7J',
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
            '_route' => 'generated::InYtEbJFiZ0LR3Yh',
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
            '_route' => 'generated::0m3cZKhuizvKx9ek',
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
            '_route' => 'generated::8YzmphcDkpFc5Bkr',
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
            '_route' => 'generated::einKLYpxg1HuSsrv',
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
            '_route' => 'generated::KN3Mg404Om765X4V',
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
            '_route' => 'generated::qHbsSJGhi3WvbtvC',
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
            '_route' => 'generated::sTI3HsIljNXKu7g8',
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
            '_route' => 'generated::R3Wmokb5rib913gw',
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
            '_route' => 'generated::LKoO3Qe0jPrTQoMA',
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
            '_route' => 'generated::7XoAJ5XJNw7iOam7',
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
            '_route' => 'generated::38S9gTzhL6vLMnjY',
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
            '_route' => 'generated::31TRNjmyLYxdWx6B',
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
            '_route' => 'generated::MRepuculHkNHoaqL',
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
            '_route' => 'generated::rVw9261uSpO6aJsH',
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
            '_route' => 'generated::IMFImXsR8QhToPeF',
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
            '_route' => 'generated::fbV7ZnURhHxD7ZLb',
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
            '_route' => 'generated::ocPiV5TF4a4j6trM',
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
            '_route' => 'generated::oghoWi7hQQYHxPQj',
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
            '_route' => 'generated::4TAkddwdj1ypNi4O',
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
            '_route' => 'generated::JsbY9EkOQtV0klCF',
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
            '_route' => 'generated::lDlTdlyJblfUcYqJ',
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
            '_route' => 'generated::0MYrBzdf0x1Jkn50',
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
            '_route' => 'generated::FYX2gGDpWpiHHZyo',
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
            '_route' => 'generated::PCmYvbcjhGKw8dLO',
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
            '_route' => 'generated::mNNbC7USC37jZ7XE',
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
            '_route' => 'generated::NbpbxnG9eRT2ymtK',
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
            '_route' => 'generated::Chcek8AGmtemgIZJ',
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
            '_route' => 'generated::rIV8coY0lkk33C0A',
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
            '_route' => 'generated::BUSwFoaLTk73mVY3',
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
            '_route' => 'generated::ey2qBTlh50LKQVmS',
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
            '_route' => 'generated::ovtznrOG7tNZMfS8',
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
            '_route' => 'generated::r8V5NoBRNdke9aeh',
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
            '_route' => 'generated::ehUZaFeEtLDqnUWR',
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
            '_route' => 'generated::5vy6ZU4dcWyFUY6F',
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
            '_route' => 'generated::tkiieVtTXoEa6NCS',
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
            '_route' => 'generated::oAeJ8HoGxGav1VyY',
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
            '_route' => 'generated::70Q3RPmOHUvV9IrR',
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
            '_route' => 'generated::Rqla83ZagBZNqxKB',
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
            '_route' => 'generated::9Bo0ffiJ9Dx32Xb5',
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
            '_route' => 'generated::tVqcvkuVYIJm1nkn',
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
            '_route' => 'generated::OAsGRh8FRNp6OxLK',
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
            '_route' => 'generated::Bw7cF8rdT6yZ7foy',
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
            '_route' => 'generated::PlP2p5kHZTwwEbGr',
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
            '_route' => 'generated::lQiGvsUQxe0yokB3',
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
            '_route' => 'generated::6TkK7DjrFjHTwBkh',
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
            '_route' => 'generated::qqoB3DTakncXrRG2',
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
            '_route' => 'generated::wPWJfe02kC5MdU7j',
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
            '_route' => 'generated::hEZk3oMA7wNHSIA9',
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
            '_route' => 'generated::CVAONJXOvlCUk7b0',
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
            '_route' => 'generated::DfgtdMmggoREWWIv',
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
            '_route' => 'generated::ASe6zFSepRvxJap0',
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
            '_route' => 'generated::yS49I7ofjYHurJnu',
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
            '_route' => 'generated::PTw74mDpmAx3MnS3',
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
            '_route' => 'generated::kTfXMjpL9mHem7Kd',
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
            '_route' => 'generated::HMMBaBPD7vbBYqdc',
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
            '_route' => 'generated::0ZKhbxsvihIbm5uQ',
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
            '_route' => 'generated::7I5Gyix7TQmQnrZh',
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
            '_route' => 'generated::qLWJONon7B87A6yW',
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
            '_route' => 'generated::rVKFCTUn2X1RAj9i',
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
            '_route' => 'generated::1GWSXOJCN87p3G09',
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
            '_route' => 'generated::16eBxGS4ky2MRGNQ',
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
            '_route' => 'generated::9VQBde7wJAxrrhVn',
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
            '_route' => 'generated::9Bshn895KbpreyEO',
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
            '_route' => 'generated::HF9JMPfb0ijMvunY',
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
            '_route' => 'generated::JStFZ7bfoKcduFrB',
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
            '_route' => 'generated::qh0aJR41muWE85vg',
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
            '_route' => 'generated::G4HuUts4AzGlEtQQ',
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
            '_route' => 'generated::wmoqBIw14dhn1Vf7',
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
            '_route' => 'generated::2lWnI4GMpbOPTyfA',
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
            '_route' => 'generated::wzriEKXn3raZtrsQ',
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
            '_route' => 'generated::uZ3VFMoLIA9QfysP',
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
            '_route' => 'generated::fql8chHqe99XNGcD',
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
            '_route' => 'generated::duhu08MQPHG00LhE',
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
            '_route' => 'generated::fhIQv8oRverMWIQw',
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
            '_route' => 'generated::w3fQwOphU2Ktvemc',
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
            '_route' => 'generated::4WXADUf6okgji5pa',
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
            '_route' => 'generated::SDGqO5Jjc8gTDKB9',
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
            '_route' => 'generated::cT83sJqIB1f1DQy6',
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
            '_route' => 'generated::UTGRGxoZjPwP53bS',
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
            '_route' => 'generated::tQTVJh6Gg1T3jO8r',
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
            '_route' => 'generated::m7HIJwhDbRGigN1x',
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
            '_route' => 'generated::hNGVtiVLq1WMfBz4',
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
            '_route' => 'generated::hWfgynrBWa4wWrEK',
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
            '_route' => 'generated::iaYworHywiYa4D5B',
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
            '_route' => 'generated::UgNBDOuMkG7P0w9B',
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
            '_route' => 'generated::Q7ZX7Jh2kzFmt6oN',
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
            '_route' => 'generated::0kd2cqqFAC8Tp5pt',
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
            '_route' => 'generated::rnVuFtHbnTxeByvE',
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
            '_route' => 'generated::vlokVRHueHCUzeb6',
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
            '_route' => 'generated::m7wFGPS7kI3NqCFi',
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
            '_route' => 'generated::hR45Vf2dk7TqELO9',
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
            '_route' => 'generated::KH3ygQo0aQWV04PD',
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
            '_route' => 'generated::xy3laTE76QvpgWoj',
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
            '_route' => 'generated::5U3ie1wli29yNcIu',
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
            '_route' => 'generated::biFs99ludLVrvjCK',
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
            '_route' => 'generated::IP66aarvafMMULgB',
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
            '_route' => 'generated::MxpbgRbQ6QnWLAtP',
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
            '_route' => 'generated::r9aXKkyNeMM1tEWL',
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
            '_route' => 'generated::dpaZ9z38LEdGNgcH',
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
            '_route' => 'generated::uAtLpUNx4hzWfhc4',
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
            '_route' => 'generated::7f5EV3Ru1VsyFtMH',
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
    'generated::goyKhysgeq6TmY66' => 
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
        'as' => 'generated::goyKhysgeq6TmY66',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
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
    'generated::nnQRwGRxZBQa3Dm9' => 
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
        'as' => 'generated::nnQRwGRxZBQa3Dm9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::FRJQ8mMk7yHiWGs5' => 
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
        'as' => 'generated::FRJQ8mMk7yHiWGs5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KkgZi5NOXh0lntYu' => 
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
        'as' => 'generated::KkgZi5NOXh0lntYu',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::DMEW2UpM1ims1tA9' => 
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
        'as' => 'generated::DMEW2UpM1ims1tA9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::UK6plsy3AUQdqZoE' => 
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
        'as' => 'generated::UK6plsy3AUQdqZoE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::rsttTayTLE5QPjxn' => 
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
        'as' => 'generated::rsttTayTLE5QPjxn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Yh4WBvdbBsGLjk2s' => 
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
        'as' => 'generated::Yh4WBvdbBsGLjk2s',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PLxruiVn9co4E20y' => 
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
        'as' => 'generated::PLxruiVn9co4E20y',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mNJ0exQ66faVy55i' => 
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
        'as' => 'generated::mNJ0exQ66faVy55i',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qSDsQSWItIPkDnhv' => 
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
        'as' => 'generated::qSDsQSWItIPkDnhv',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::8zY1G8gEP0xkrzNf' => 
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
        'as' => 'generated::8zY1G8gEP0xkrzNf',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Q9oyAElk1tJmPk3N' => 
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
        'as' => 'generated::Q9oyAElk1tJmPk3N',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::t0FUoSyh50VWq5Pf' => 
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
        'as' => 'generated::t0FUoSyh50VWq5Pf',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::CFhi9zcjWAXXe8LG' => 
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
        'as' => 'generated::CFhi9zcjWAXXe8LG',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::AGFSNIxG2lVinvDR' => 
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
        'as' => 'generated::AGFSNIxG2lVinvDR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qtVtoy4ywv95UxUC' => 
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
        'as' => 'generated::qtVtoy4ywv95UxUC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::f1QiHdnMlJ70G5dP' => 
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
        'as' => 'generated::f1QiHdnMlJ70G5dP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::jMu74hayixpGC9vl' => 
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
        'as' => 'generated::jMu74hayixpGC9vl',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::p0CQduQH1unpjjHS' => 
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
        'as' => 'generated::p0CQduQH1unpjjHS',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::InYtEbJFiZ0LR3Yh' => 
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
        'as' => 'generated::InYtEbJFiZ0LR3Yh',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0m3cZKhuizvKx9ek' => 
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
        'as' => 'generated::0m3cZKhuizvKx9ek',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::einKLYpxg1HuSsrv' => 
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
        'as' => 'generated::einKLYpxg1HuSsrv',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KN3Mg404Om765X4V' => 
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
        'as' => 'generated::KN3Mg404Om765X4V',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qHbsSJGhi3WvbtvC' => 
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
        'as' => 'generated::qHbsSJGhi3WvbtvC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::8YzmphcDkpFc5Bkr' => 
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
        'as' => 'generated::8YzmphcDkpFc5Bkr',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::sTI3HsIljNXKu7g8' => 
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
        'as' => 'generated::sTI3HsIljNXKu7g8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::R3Wmokb5rib913gw' => 
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
        'as' => 'generated::R3Wmokb5rib913gw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::vyzci0its7YzQXkQ' => 
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
        'as' => 'generated::vyzci0its7YzQXkQ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9Bq8f1eylcynp38U' => 
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
        'as' => 'generated::9Bq8f1eylcynp38U',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gYhMqsLUILozQu7J' => 
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
        'as' => 'generated::gYhMqsLUILozQu7J',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::LKoO3Qe0jPrTQoMA' => 
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
        'as' => 'generated::LKoO3Qe0jPrTQoMA',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tei3IXZ6449pCJJU' => 
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
        'as' => 'generated::tei3IXZ6449pCJJU',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gLtPpCHruqu8rPh6' => 
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
        'as' => 'generated::gLtPpCHruqu8rPh6',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::fWJ3KNdQcnYXnNuG' => 
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
        'as' => 'generated::fWJ3KNdQcnYXnNuG',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::sXWAWySPllTiKqUx' => 
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
        'as' => 'generated::sXWAWySPllTiKqUx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::JtlRSk5HDbWYrJcN' => 
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
        'as' => 'generated::JtlRSk5HDbWYrJcN',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::31TRNjmyLYxdWx6B' => 
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
        'as' => 'generated::31TRNjmyLYxdWx6B',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::MRepuculHkNHoaqL' => 
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
        'as' => 'generated::MRepuculHkNHoaqL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::7XoAJ5XJNw7iOam7' => 
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
        'as' => 'generated::7XoAJ5XJNw7iOam7',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::38S9gTzhL6vLMnjY' => 
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
        'as' => 'generated::38S9gTzhL6vLMnjY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tUYmSzTc1qK0HPVu' => 
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
        'as' => 'generated::tUYmSzTc1qK0HPVu',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::rVw9261uSpO6aJsH' => 
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
        'as' => 'generated::rVw9261uSpO6aJsH',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IMFImXsR8QhToPeF' => 
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
        'as' => 'generated::IMFImXsR8QhToPeF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::fbV7ZnURhHxD7ZLb' => 
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
        'as' => 'generated::fbV7ZnURhHxD7ZLb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ocPiV5TF4a4j6trM' => 
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
        'as' => 'generated::ocPiV5TF4a4j6trM',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::oghoWi7hQQYHxPQj' => 
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
        'as' => 'generated::oghoWi7hQQYHxPQj',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::FkHr961Y947wuQcq' => 
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
        'as' => 'generated::FkHr961Y947wuQcq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::5oNjAGKZARCCIqMB' => 
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
        'as' => 'generated::5oNjAGKZARCCIqMB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4TAkddwdj1ypNi4O' => 
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
        'as' => 'generated::4TAkddwdj1ypNi4O',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::JsbY9EkOQtV0klCF' => 
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
        'as' => 'generated::JsbY9EkOQtV0klCF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::lGE9XLDhFs6zQI5q' => 
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
        'as' => 'generated::lGE9XLDhFs6zQI5q',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::w8GVYL5uqPzq3kuW' => 
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
        'as' => 'generated::w8GVYL5uqPzq3kuW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::lDlTdlyJblfUcYqJ' => 
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
        'as' => 'generated::lDlTdlyJblfUcYqJ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0MYrBzdf0x1Jkn50' => 
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
        'as' => 'generated::0MYrBzdf0x1Jkn50',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::w3mvqsMgtCJM4gdW' => 
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
        'as' => 'generated::w3mvqsMgtCJM4gdW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::FYX2gGDpWpiHHZyo' => 
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
        'as' => 'generated::FYX2gGDpWpiHHZyo',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::WnQiJpWzPpKKNk3O' => 
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
        'as' => 'generated::WnQiJpWzPpKKNk3O',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::iTDGdtPcRK20nQX3' => 
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
        'as' => 'generated::iTDGdtPcRK20nQX3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0ryV0tV19unRoFte' => 
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
        'as' => 'generated::0ryV0tV19unRoFte',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::aMUv4c6ZO4gDuPQ8' => 
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
        'as' => 'generated::aMUv4c6ZO4gDuPQ8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::6ZZbouHO7jLRzRA1' => 
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
        'as' => 'generated::6ZZbouHO7jLRzRA1',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::c3y8iPssJUnKooKw' => 
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
        'as' => 'generated::c3y8iPssJUnKooKw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1VTaQ5VxrVdr5Ig7' => 
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
        'as' => 'generated::1VTaQ5VxrVdr5Ig7',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::55W6hNMRyzKUoGk0' => 
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
        'as' => 'generated::55W6hNMRyzKUoGk0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::6hYB5YTwCvAV5BE5' => 
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
        'as' => 'generated::6hYB5YTwCvAV5BE5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::UsQqL13MZHnDRt3U' => 
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
        'as' => 'generated::UsQqL13MZHnDRt3U',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Ot7Xxa7EjcR6I78s' => 
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
        'as' => 'generated::Ot7Xxa7EjcR6I78s',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Q9Lxpurq5fa5vW6D' => 
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
        'as' => 'generated::Q9Lxpurq5fa5vW6D',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PCmYvbcjhGKw8dLO' => 
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
        'as' => 'generated::PCmYvbcjhGKw8dLO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mNNbC7USC37jZ7XE' => 
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
        'as' => 'generated::mNNbC7USC37jZ7XE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::l7P75zQdKsBkzgv1' => 
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
        'as' => 'generated::l7P75zQdKsBkzgv1',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::uEsO2gJKW2bShuFt' => 
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
        'as' => 'generated::uEsO2gJKW2bShuFt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::NbpbxnG9eRT2ymtK' => 
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
        'as' => 'generated::NbpbxnG9eRT2ymtK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Chcek8AGmtemgIZJ' => 
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
        'as' => 'generated::Chcek8AGmtemgIZJ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tLsAgbabmKM60Wk2' => 
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
        'as' => 'generated::tLsAgbabmKM60Wk2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qwgnll5iTIe4iCa6' => 
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
        'as' => 'generated::qwgnll5iTIe4iCa6',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::rIV8coY0lkk33C0A' => 
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
        'as' => 'generated::rIV8coY0lkk33C0A',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::BUSwFoaLTk73mVY3' => 
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
        'as' => 'generated::BUSwFoaLTk73mVY3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ey2qBTlh50LKQVmS' => 
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
        'as' => 'generated::ey2qBTlh50LKQVmS',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::e7QxzppFMyFWotUz' => 
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
        'as' => 'generated::e7QxzppFMyFWotUz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::MB5uRljnWRqkhzr2' => 
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
        'as' => 'generated::MB5uRljnWRqkhzr2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::sue4lVZYnXxwCrqM' => 
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
        'as' => 'generated::sue4lVZYnXxwCrqM',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::X4X1z90dc3RGNrrt' => 
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
        'as' => 'generated::X4X1z90dc3RGNrrt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::70Q3RPmOHUvV9IrR' => 
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
        'as' => 'generated::70Q3RPmOHUvV9IrR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Rqla83ZagBZNqxKB' => 
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
        'as' => 'generated::Rqla83ZagBZNqxKB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::FNWAUXPdNAQBSjoa' => 
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
        'as' => 'generated::FNWAUXPdNAQBSjoa',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GkaRwzmi8DywjLe0' => 
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
        'as' => 'generated::GkaRwzmi8DywjLe0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::eJc26oYZn3wTXpJu' => 
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
        'as' => 'generated::eJc26oYZn3wTXpJu',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::bPrubk3IsRuSwx8S' => 
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
        'as' => 'generated::bPrubk3IsRuSwx8S',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9Bo0ffiJ9Dx32Xb5' => 
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
        'as' => 'generated::9Bo0ffiJ9Dx32Xb5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Zl8t5b7k4poavPdn' => 
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
        'as' => 'generated::Zl8t5b7k4poavPdn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GthLlFfrAUj37mUw' => 
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
        'as' => 'generated::GthLlFfrAUj37mUw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::OwWsurWMdicHwiIU' => 
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
        'as' => 'generated::OwWsurWMdicHwiIU',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ljqWIhGLeXNIo4QL' => 
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
        'as' => 'generated::ljqWIhGLeXNIo4QL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ovtznrOG7tNZMfS8' => 
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
        'as' => 'generated::ovtznrOG7tNZMfS8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::r8V5NoBRNdke9aeh' => 
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
        'as' => 'generated::r8V5NoBRNdke9aeh',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::3Qws0lctWgYJdhKL' => 
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
        'as' => 'generated::3Qws0lctWgYJdhKL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::D7Z8kRzNa6WhukUA' => 
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
        'as' => 'generated::D7Z8kRzNa6WhukUA',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ehUZaFeEtLDqnUWR' => 
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
        'as' => 'generated::ehUZaFeEtLDqnUWR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::5vy6ZU4dcWyFUY6F' => 
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
        'as' => 'generated::5vy6ZU4dcWyFUY6F',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::zbgwqbZPVUdcxyC2' => 
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
        'as' => 'generated::zbgwqbZPVUdcxyC2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::OkIviyqOyWaYzNo7' => 
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
        'as' => 'generated::OkIviyqOyWaYzNo7',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tkiieVtTXoEa6NCS' => 
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
        'as' => 'generated::tkiieVtTXoEa6NCS',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::oAeJ8HoGxGav1VyY' => 
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
        'as' => 'generated::oAeJ8HoGxGav1VyY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::XwmZBXj4tkCsPXJo' => 
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
        'as' => 'generated::XwmZBXj4tkCsPXJo',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::EXVRQyTnCW4Qse8n' => 
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
        'as' => 'generated::EXVRQyTnCW4Qse8n',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::grk6Kp6dfCJy3F1e' => 
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
        'as' => 'generated::grk6Kp6dfCJy3F1e',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4pBnTsJMH7Ig9rfC' => 
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
        'as' => 'generated::4pBnTsJMH7Ig9rfC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::K37jGjg8kkCD9JWW' => 
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
        'as' => 'generated::K37jGjg8kkCD9JWW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::VnZgXrOaTTBR6cf3' => 
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
        'as' => 'generated::VnZgXrOaTTBR6cf3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::cu4UrCWhh4NbZTIQ' => 
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
        'as' => 'generated::cu4UrCWhh4NbZTIQ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GDemmF5KapZSWQQY' => 
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
        'as' => 'generated::GDemmF5KapZSWQQY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::79KVCBkRwi0Ri67r' => 
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
        'as' => 'generated::79KVCBkRwi0Ri67r',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::WE2NYoma29JyQyu7' => 
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
        'as' => 'generated::WE2NYoma29JyQyu7',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ypKIDNWASblqJ8HZ' => 
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
        'as' => 'generated::ypKIDNWASblqJ8HZ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::bw3wh0NhlG7BvXln' => 
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
        'as' => 'generated::bw3wh0NhlG7BvXln',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::FWuYrAcecEAObjJa' => 
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
        'as' => 'generated::FWuYrAcecEAObjJa',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::xfKqMTgJJ5yZI4MP' => 
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
        'as' => 'generated::xfKqMTgJJ5yZI4MP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::DXN4msVRjHfZgsgr' => 
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
        'as' => 'generated::DXN4msVRjHfZgsgr',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::QjB9eOsX5uzd1Tdi' => 
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
        'as' => 'generated::QjB9eOsX5uzd1Tdi',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ASe6zFSepRvxJap0' => 
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
        'as' => 'generated::ASe6zFSepRvxJap0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::yS49I7ofjYHurJnu' => 
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
        'as' => 'generated::yS49I7ofjYHurJnu',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::s6cNWx2jmIONP96M' => 
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
        'as' => 'generated::s6cNWx2jmIONP96M',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ghxD2sGlXohx78QF' => 
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
        'as' => 'generated::ghxD2sGlXohx78QF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PTw74mDpmAx3MnS3' => 
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
        'as' => 'generated::PTw74mDpmAx3MnS3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::kTfXMjpL9mHem7Kd' => 
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
        'as' => 'generated::kTfXMjpL9mHem7Kd',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::HMMBaBPD7vbBYqdc' => 
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
        'as' => 'generated::HMMBaBPD7vbBYqdc',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::puGqBX6YMv4IXiKL' => 
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
        'as' => 'generated::puGqBX6YMv4IXiKL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0ZKhbxsvihIbm5uQ' => 
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
        'as' => 'generated::0ZKhbxsvihIbm5uQ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::N2omDz6anOLyhpb2' => 
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
        'as' => 'generated::N2omDz6anOLyhpb2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::vjSW9ZRETdhHvtb2' => 
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
        'as' => 'generated::vjSW9ZRETdhHvtb2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::7I5Gyix7TQmQnrZh' => 
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
        'as' => 'generated::7I5Gyix7TQmQnrZh',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::5EWUEiSwUdphx1wC' => 
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
        'as' => 'generated::5EWUEiSwUdphx1wC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::sBYD3cQexommGYJy' => 
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
        'as' => 'generated::sBYD3cQexommGYJy',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qLWJONon7B87A6yW' => 
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
        'as' => 'generated::qLWJONon7B87A6yW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::o4PaSi29JpLX4QJd' => 
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
        'as' => 'generated::o4PaSi29JpLX4QJd',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::bZmiOK3pG6YIruUG' => 
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
        'as' => 'generated::bZmiOK3pG6YIruUG',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4WKIFO6BY9EDWA1a' => 
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
        'as' => 'generated::4WKIFO6BY9EDWA1a',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ohuB6QJdQNbQMb99' => 
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
        'as' => 'generated::ohuB6QJdQNbQMb99',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::YEEDn7AXwFrpJ9Uk' => 
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
        'as' => 'generated::YEEDn7AXwFrpJ9Uk',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Egva8Tu0JhW2JJsN' => 
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
        'as' => 'generated::Egva8Tu0JhW2JJsN',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::MvknDXO69yLg7k1I' => 
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
        'as' => 'generated::MvknDXO69yLg7k1I',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::jinepGIDEJr0nnGk' => 
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
        'as' => 'generated::jinepGIDEJr0nnGk',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0jB4jFHjiEQiBJVo' => 
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
        'as' => 'generated::0jB4jFHjiEQiBJVo',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::CdJ6oHFof0APC3Mz' => 
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
        'as' => 'generated::CdJ6oHFof0APC3Mz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::eNLJr76PzcaOwYw8' => 
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
        'as' => 'generated::eNLJr76PzcaOwYw8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::AvQLAGDdPM5D0ZBX' => 
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
        'as' => 'generated::AvQLAGDdPM5D0ZBX',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ZUGIRqQSe7Iwvxn0' => 
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
        'as' => 'generated::ZUGIRqQSe7Iwvxn0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::i5h66b0kUBGGzbfI' => 
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
        'as' => 'generated::i5h66b0kUBGGzbfI',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::hqmyYooNbnSPiuRp' => 
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
        'as' => 'generated::hqmyYooNbnSPiuRp',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::RJMkGYrIbGW5IjJC' => 
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
        'as' => 'generated::RJMkGYrIbGW5IjJC',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::srH0fE3AVA2KTQrW' => 
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
        'as' => 'generated::srH0fE3AVA2KTQrW',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::sbelY9HI8bjaSmOJ' => 
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
        'as' => 'generated::sbelY9HI8bjaSmOJ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::k9mD0zgP50EKVgi7' => 
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
        'as' => 'generated::k9mD0zgP50EKVgi7',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::rVKFCTUn2X1RAj9i' => 
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
        'as' => 'generated::rVKFCTUn2X1RAj9i',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1GWSXOJCN87p3G09' => 
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
        'as' => 'generated::1GWSXOJCN87p3G09',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::16eBxGS4ky2MRGNQ' => 
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
        'as' => 'generated::16eBxGS4ky2MRGNQ',
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
    'generated::tVqcvkuVYIJm1nkn' => 
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
        'as' => 'generated::tVqcvkuVYIJm1nkn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::OAsGRh8FRNp6OxLK' => 
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
        'as' => 'generated::OAsGRh8FRNp6OxLK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PlP2p5kHZTwwEbGr' => 
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
        'as' => 'generated::PlP2p5kHZTwwEbGr',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::lQiGvsUQxe0yokB3' => 
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
        'as' => 'generated::lQiGvsUQxe0yokB3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9VQBde7wJAxrrhVn' => 
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
        'as' => 'generated::9VQBde7wJAxrrhVn',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::9Bshn895KbpreyEO' => 
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
        'as' => 'generated::9Bshn895KbpreyEO',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::HF9JMPfb0ijMvunY' => 
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
        'as' => 'generated::HF9JMPfb0ijMvunY',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1XsKHevStfzjdPgF' => 
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
        'as' => 'generated::1XsKHevStfzjdPgF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IHWFaTYe7FwlS5SM' => 
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
        'as' => 'generated::IHWFaTYe7FwlS5SM',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::JStFZ7bfoKcduFrB' => 
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
        'as' => 'generated::JStFZ7bfoKcduFrB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qh0aJR41muWE85vg' => 
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
        'as' => 'generated::qh0aJR41muWE85vg',
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
    'generated::G4HuUts4AzGlEtQQ' => 
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
        'as' => 'generated::G4HuUts4AzGlEtQQ',
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
    'generated::wmoqBIw14dhn1Vf7' => 
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
        'as' => 'generated::wmoqBIw14dhn1Vf7',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::2lWnI4GMpbOPTyfA' => 
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
        'as' => 'generated::2lWnI4GMpbOPTyfA',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Vz1F7fOCw6zVlYDF' => 
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
        'as' => 'generated::Vz1F7fOCw6zVlYDF',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::wzriEKXn3raZtrsQ' => 
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
        'as' => 'generated::wzriEKXn3raZtrsQ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::uZ3VFMoLIA9QfysP' => 
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
        'as' => 'generated::uZ3VFMoLIA9QfysP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::duhu08MQPHG00LhE' => 
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
        'as' => 'generated::duhu08MQPHG00LhE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::fhIQv8oRverMWIQw' => 
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
        'as' => 'generated::fhIQv8oRverMWIQw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::w3fQwOphU2Ktvemc' => 
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
        'as' => 'generated::w3fQwOphU2Ktvemc',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::R0TEWj2fgK0P80gd' => 
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
        'as' => 'generated::R0TEWj2fgK0P80gd',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::4WXADUf6okgji5pa' => 
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
        'as' => 'generated::4WXADUf6okgji5pa',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::SDGqO5Jjc8gTDKB9' => 
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
        'as' => 'generated::SDGqO5Jjc8gTDKB9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::cT83sJqIB1f1DQy6' => 
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
        'as' => 'generated::cT83sJqIB1f1DQy6',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::UTGRGxoZjPwP53bS' => 
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
        'as' => 'generated::UTGRGxoZjPwP53bS',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::tQTVJh6Gg1T3jO8r' => 
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
        'as' => 'generated::tQTVJh6Gg1T3jO8r',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::hNGVtiVLq1WMfBz4' => 
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
        'as' => 'generated::hNGVtiVLq1WMfBz4',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::m7HIJwhDbRGigN1x' => 
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
        'as' => 'generated::m7HIJwhDbRGigN1x',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::DFlQUi4gFugCUEpk' => 
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
        'as' => 'generated::DFlQUi4gFugCUEpk',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::J7hQ4mW8zoHvkTrE' => 
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
        'as' => 'generated::J7hQ4mW8zoHvkTrE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::mLa9SwCsF0dy2Fy5' => 
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
        'as' => 'generated::mLa9SwCsF0dy2Fy5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::otj9v0mPpXKhFB5v' => 
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
        'as' => 'generated::otj9v0mPpXKhFB5v',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::SHLhyOTHB9gSCFD0' => 
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
        'as' => 'generated::SHLhyOTHB9gSCFD0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gdmobWUz9Ig82X98' => 
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
        'as' => 'generated::gdmobWUz9Ig82X98',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::hWfgynrBWa4wWrEK' => 
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
        'as' => 'generated::hWfgynrBWa4wWrEK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::TkJfYGoBZCfQxwAi' => 
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
        'as' => 'generated::TkJfYGoBZCfQxwAi',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::iaYworHywiYa4D5B' => 
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
        'as' => 'generated::iaYworHywiYa4D5B',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::UgNBDOuMkG7P0w9B' => 
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
        'as' => 'generated::UgNBDOuMkG7P0w9B',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::og13O2u1hRi0Eh9H' => 
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
        'as' => 'generated::og13O2u1hRi0Eh9H',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1A48jhpr5mLyXkkm' => 
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
        'as' => 'generated::1A48jhpr5mLyXkkm',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Q7ZX7Jh2kzFmt6oN' => 
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
        'as' => 'generated::Q7ZX7Jh2kzFmt6oN',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::0kd2cqqFAC8Tp5pt' => 
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
        'as' => 'generated::0kd2cqqFAC8Tp5pt',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ks4Mv7QDTKARqQes' => 
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
        'as' => 'generated::ks4Mv7QDTKARqQes',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::MFvLBs0sntDCaq4m' => 
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
        'as' => 'generated::MFvLBs0sntDCaq4m',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::rnVuFtHbnTxeByvE' => 
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
        'as' => 'generated::rnVuFtHbnTxeByvE',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::1NesmLIVNVSsXlhr' => 
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
        'as' => 'generated::1NesmLIVNVSsXlhr',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::vlokVRHueHCUzeb6' => 
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
        'as' => 'generated::vlokVRHueHCUzeb6',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::m7wFGPS7kI3NqCFi' => 
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
        'as' => 'generated::m7wFGPS7kI3NqCFi',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::hR45Vf2dk7TqELO9' => 
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
        'as' => 'generated::hR45Vf2dk7TqELO9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KH3ygQo0aQWV04PD' => 
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
        'as' => 'generated::KH3ygQo0aQWV04PD',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::KTJgnUHT5Qrn1mWX' => 
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
        'as' => 'generated::KTJgnUHT5Qrn1mWX',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GPYFYLCI9LorYDLL' => 
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
        'as' => 'generated::GPYFYLCI9LorYDLL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Z6qmhSajcKOSvGT3' => 
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
        'as' => 'generated::Z6qmhSajcKOSvGT3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::xy3laTE76QvpgWoj' => 
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
        'as' => 'generated::xy3laTE76QvpgWoj',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::5U3ie1wli29yNcIu' => 
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
        'as' => 'generated::5U3ie1wli29yNcIu',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::biFs99ludLVrvjCK' => 
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
        'as' => 'generated::biFs99ludLVrvjCK',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::6zWI0ZGMcsjvFhDv' => 
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
        'as' => 'generated::6zWI0ZGMcsjvFhDv',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qbfUKIYVzfYLtWFb' => 
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
        'as' => 'generated::qbfUKIYVzfYLtWFb',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::OTVnMj3v5Hb4onYV' => 
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
        'as' => 'generated::OTVnMj3v5Hb4onYV',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::IP66aarvafMMULgB' => 
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
        'as' => 'generated::IP66aarvafMMULgB',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::CeXZTb41HueOOOJq' => 
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
        'as' => 'generated::CeXZTb41HueOOOJq',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::fql8chHqe99XNGcD' => 
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
        'as' => 'generated::fql8chHqe99XNGcD',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::MxpbgRbQ6QnWLAtP' => 
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
        'as' => 'generated::MxpbgRbQ6QnWLAtP',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::r9aXKkyNeMM1tEWL' => 
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
        'as' => 'generated::r9aXKkyNeMM1tEWL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::dpaZ9z38LEdGNgcH' => 
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
        'as' => 'generated::dpaZ9z38LEdGNgcH',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::uAtLpUNx4hzWfhc4' => 
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
        'as' => 'generated::uAtLpUNx4hzWfhc4',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::6TkK7DjrFjHTwBkh' => 
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
        'as' => 'generated::6TkK7DjrFjHTwBkh',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qqoB3DTakncXrRG2' => 
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
        'as' => 'generated::qqoB3DTakncXrRG2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Bw7cF8rdT6yZ7foy' => 
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
        'as' => 'generated::Bw7cF8rdT6yZ7foy',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::wPWJfe02kC5MdU7j' => 
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
        'as' => 'generated::wPWJfe02kC5MdU7j',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::hEZk3oMA7wNHSIA9' => 
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
        'as' => 'generated::hEZk3oMA7wNHSIA9',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::CVAONJXOvlCUk7b0' => 
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
        'as' => 'generated::CVAONJXOvlCUk7b0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::DfgtdMmggoREWWIv' => 
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
        'as' => 'generated::DfgtdMmggoREWWIv',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::wbZE2crqSJdED8r3' => 
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
        'as' => 'generated::wbZE2crqSJdED8r3',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::V1Yzj00X5qyrC7e0' => 
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
        'as' => 'generated::V1Yzj00X5qyrC7e0',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::OhV4pt8AEgI05civ' => 
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
        'as' => 'generated::OhV4pt8AEgI05civ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::qzism3X93gWGyCU2' => 
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
        'as' => 'generated::qzism3X93gWGyCU2',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::eQp1VCl9kxouspqQ' => 
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
        'as' => 'generated::eQp1VCl9kxouspqQ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Qrru1dvbId2CWw2K' => 
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
        'as' => 'generated::Qrru1dvbId2CWw2K',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::oO0R0GXhFckQDNID' => 
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
        'as' => 'generated::oO0R0GXhFckQDNID',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::6wI3ecKpyVsatPJ8' => 
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
        'as' => 'generated::6wI3ecKpyVsatPJ8',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ty5vR0mcuvoJtgfi' => 
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
        'as' => 'generated::ty5vR0mcuvoJtgfi',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::ImvPkiaJ9fw3mNps' => 
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
        'as' => 'generated::ImvPkiaJ9fw3mNps',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::hBPvNLlZ408LN8DL' => 
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
        'as' => 'generated::hBPvNLlZ408LN8DL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::V2pNVruFX32SrHiR' => 
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
        'as' => 'generated::V2pNVruFX32SrHiR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::AfsOKOxD0zvRfWRu' => 
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
        'as' => 'generated::AfsOKOxD0zvRfWRu',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::zssoB9BYxItDizg5' => 
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
        'as' => 'generated::zssoB9BYxItDizg5',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::k401VgjXtYWeUBRw' => 
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
        'as' => 'generated::k401VgjXtYWeUBRw',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PFW5sNhm08rU3mVz' => 
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
        'as' => 'generated::PFW5sNhm08rU3mVz',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::dzntBMkpwlGtYoTo' => 
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
        'as' => 'generated::dzntBMkpwlGtYoTo',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::PnIIUyDFpaYAblHI' => 
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
        'as' => 'generated::PnIIUyDFpaYAblHI',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Ak6mBVsduDSyqaZv' => 
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
        'as' => 'generated::Ak6mBVsduDSyqaZv',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::gvenXGQeyAbOSulx' => 
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
        'as' => 'generated::gvenXGQeyAbOSulx',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::GAU0H4SW0WQk5OpQ' => 
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
        'as' => 'generated::GAU0H4SW0WQk5OpQ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::7f5EV3Ru1VsyFtMH' => 
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
        'as' => 'generated::7f5EV3Ru1VsyFtMH',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
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
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000005530000000000000000";}}',
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
    'generated::QAMxZ3o1dGMggjfJ' => 
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
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000005550000000000000000";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::QAMxZ3o1dGMggjfJ',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::MEqY0NLSNdYo1ZOR' => 
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
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"00000000000005570000000000000000";}}',
        'namespace' => NULL,
        'prefix' => 'api',
        'where' => 
        array (
        ),
        'as' => 'generated::MEqY0NLSNdYo1ZOR',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::m452aa7cULifFuiy' => 
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
                }";s:5:"scope";s:54:"Illuminate\\Foundation\\Configuration\\ApplicationBuilder";s:4:"this";N;s:4:"self";s:32:"000000000000045a0000000000000000";}}',
        'as' => 'generated::m452aa7cULifFuiy',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
      array (
      ),
      'bindingFields' => 
      array (
      ),
      'lockSeconds' => NULL,
      'waitSeconds' => NULL,
      'withTrashed' => false,
    ),
    'generated::Cf0D2RD7VsVPPfuL' => 
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
}";s:5:"scope";s:37:"Illuminate\\Routing\\RouteFileRegistrar";s:4:"this";N;s:4:"self";s:32:"000000000000055c0000000000000000";}}',
        'namespace' => NULL,
        'prefix' => '',
        'where' => 
        array (
        ),
        'as' => 'generated::Cf0D2RD7VsVPPfuL',
      ),
      'fallback' => false,
      'defaults' => 
      array (
      ),
      'wheres' => 
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
                }";s:5:"scope";s:47:"Illuminate\\Filesystem\\FilesystemServiceProvider";s:4:"this";N;s:4:"self";s:32:"000000000000055e0000000000000000";}}',
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
                }";s:5:"scope";s:47:"Illuminate\\Filesystem\\FilesystemServiceProvider";s:4:"this";N;s:4:"self";s:32:"00000000000005600000000000000000";}}',
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
