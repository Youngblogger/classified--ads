<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f5f5f5;
            margin: 0;
            padding: 20px;
        }
        .container {
            max-width: 480px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
            font-size: 14px;
        }
        .content {
            padding: 40px 30px;
            text-align: center;
        }
        .greeting {
            color: #333;
            font-size: 16px;
            margin-bottom: 20px;
        }
        .otp-code {
            font-size: 42px;
            font-weight: 700;
            letter-spacing: 12px;
            color: #667eea;
            background-color: #f8f9ff;
            padding: 20px 30px;
            border-radius: 8px;
            margin: 20px 0;
            border: 2px dashed #667eea;
        }
        .info {
            color: #666;
            font-size: 14px;
            line-height: 1.6;
            margin-top: 25px;
        }
        .warning {
            background-color: #fff3cd;
            border: 1px solid #ffc107;
            border-radius: 6px;
            padding: 15px;
            margin-top: 25px;
            font-size: 13px;
            color: #856404;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Email</h1>
            <p>Complete your registration</p>
        </div>
        
        <div class="content">
            <p class="greeting">Hi {{ $user->name }},</p>
            
            <p style="color: #666; font-size: 15px;">
                Thank you for registering! Please use the following verification code to verify your email address:
            </p>
            
            <div class="otp-code">{{ $otp }}</div>
            
            <p class="info">
                This code will expire in <strong>5 minutes</strong>.<br>
                Enter this code on the verification page to activate your account.
            </p>
            
            <div class="warning">
                <strong>Security Notice:</strong><br>
                • Never share this code with anyone<br>
                • Our team will never ask for this code<br>
                • If you didn't request this, please ignore this email
            </div>
        </div>
        
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
            <p>&copy; {{ date('Y') }} Classified Ads Marketplace. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
