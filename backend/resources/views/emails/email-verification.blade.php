<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email Address</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            line-height: 1.6;
        }
        .container {
            max-width: 480px;
            margin: 0 auto;
            padding: 20px;
        }
        .card {
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
        }
        .header p {
            color: rgba(255,255,255,0.9);
            font-size: 14px;
            margin-top: 8px;
        }
        .body {
            padding: 32px 24px;
            text-align: center;
        }
        .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 16px;
        }
        .message {
            font-size: 14px;
            color: #666;
            margin-bottom: 24px;
            line-height: 1.6;
        }
        .btn {
            display: inline-block;
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 40px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            margin: 8px 0 24px;
        }
        .btn:hover {
            transform: translateY(-2px);
        }
        .fallback-link {
            font-size: 12px;
            color: #999;
            word-break: break-all;
            margin-top: 16px;
        }
        .fallback-link a {
            color: #0d9488;
        }
        .warning {
            background: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            padding: 16px;
            font-size: 13px;
            color: #856404;
            text-align: left;
            margin-top: 24px;
        }
        .footer {
            padding: 24px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <h1>Verify Your Email</h1>
                <p>{{ config('app.name') }}</p>
            </div>
            <div class="body">
                <p class="greeting">Hi {{ $user->name }},</p>
                <p class="message">
                    Thank you for joining {{ config('app.name') }}! Please verify your email address by clicking the button below.
                </p>
                <a href="{{ $verificationUrl }}" class="btn">
                    Verify Email Address
                </a>
                <p class="message" style="font-size: 13px;">
                    This link will expire in <strong>24 hours</strong>.
                </p>
                <p class="message" style="font-size: 13px;">
                    If you did not create an account, no further action is required.
                </p>
                <div class="fallback-link">
                    If the button doesn't work, copy and paste this URL into your browser:<br>
                    <a href="{{ $verificationUrl }}">{{ $verificationUrl }}</a>
                </div>
                <div class="warning">
                    <strong>Security Notice:</strong><br>
                    Never share this link with anyone. Our team will never ask you to verify your email through any other means.
                </div>
            </div>
            <div class="footer">
                &copy; {{ date('Y') }} {{ config('app.name') }}. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
