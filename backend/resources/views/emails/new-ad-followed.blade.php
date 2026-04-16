<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Ad from {{ $sellerName }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f6f7;
            line-height: 1.6;
            color: #333;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .email-card {
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .email-header {
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
            padding: 32px 24px;
            text-align: center;
        }
        .email-header h1 {
            color: #ffffff;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
        }
        .email-header p {
            color: rgba(255,255,255,0.9);
            font-size: 14px;
        }
        .email-body {
            padding: 24px;
        }
        .greeting {
            font-size: 16px;
            color: #333;
            margin-bottom: 16px;
        }
        .highlight-box {
            background: #f0fdfa;
            border: 2px solid #99f6e4;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .seller-name {
            font-size: 14px;
            color: #0d9488;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .ad-title {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 8px;
        }
        .ad-price {
            font-size: 28px;
            font-weight: 800;
            color: #0d9488;
        }
        .ad-image {
            width: 100%;
            height: 250px;
            object-fit: cover;
            border-radius: 8px;
            margin-bottom: 20px;
            background: #f3f4f6;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
            color: #ffffff;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            text-align: center;
            width: 100%;
            margin-bottom: 24px;
            transition: transform 0.2s;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .info-text {
            font-size: 14px;
            color: #6b7280;
            text-align: center;
            margin-bottom: 24px;
        }
        .email-footer {
            background: #f9fafb;
            padding: 24px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer-links {
            margin-bottom: 16px;
        }
        .footer-links a {
            color: #0d9488;
            text-decoration: none;
            font-size: 14px;
            margin: 0 12px;
        }
        .footer-text {
            font-size: 12px;
            color: #9ca3af;
        }
        .footer-text a {
            color: #0d9488;
            text-decoration: none;
        }
        @media only screen and (max-width: 480px) {
            .email-container {
                padding: 10px;
            }
            .email-header {
                padding: 24px 16px;
            }
            .email-header h1 {
                font-size: 20px;
            }
            .email-body {
                padding: 16px;
            }
            .ad-price {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-card">
            <!-- Header -->
            <div class="email-header">
                <h1>🆕 New Item from a Seller You Follow!</h1>
                <p>{{ $sellerName }} just posted something new</p>
            </div>
            
            <!-- Body -->
            <div class="email-body">
                <p class="greeting">Hey {{ $followerName }},</p>
                
                <p style="font-size: 14px; color: #6b7280; margin-bottom: 20px;">
                    {{ $sellerName }} just posted a new item on {{ $appName }}. Don't miss out!
                </p>
                
                <!-- Ad Card -->
                <div class="highlight-box">
                    <p class="seller-name">by {{ $sellerName }}</p>
                    <p class="ad-title">{{ $adTitle }}</p>
                    <p class="ad-price">{{ $adPrice }}</p>
                </div>
                
                @if($adImage)
                    <img src="{{ $adImage }}" alt="{{ $adTitle }}" class="ad-image" />
                @endif
                
                <a href="{{ $adUrl }}" class="cta-button">
                    View This Item →
                </a>
                
                <p class="info-text">
                    Tap the button above to see all the details and contact the seller directly.
                </p>
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <div class="footer-links">
                    <a href="{{ $appUrl }}">Home</a>
                    <a href="{{ $appUrl }}/dashboard/following">Following</a>
                    <a href="{{ $appUrl }}/settings">Settings</a>
                </div>
                <p class="footer-text">
                    You're receiving this email because you follow {{ $sellerName }} on <a href="{{ $appUrl }}">{{ $appName }}</a>.<br>
                    To stop receiving these emails, <a href="{{ $appUrl }}/dashboard/following">unfollow this seller</a>.
                </p>
            </div>
        </div>
    </div>
</body>
</html>
