<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BusinessVerification;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class BusinessVerificationController extends Controller
{
    public function myBusinessVerification(Request $request)
    {
        $user = $request->user();

        try {
            $isVerifiedSeller = $user->is_verified_seller ?? false;

            $verification = BusinessVerification::getLatestForUser($user->id);

            $hasStore = $user->store()->exists();

            return response()->json([
                'success' => true,
                'verification' => $verification,
                'status' => $verification ? $verification->status : 'none',
                'business_name' => $verification ? $verification->business_name : null,
                'has_store' => $hasStore,
                'is_verified_seller' => $isVerifiedSeller,
                'is_verified_business' => (bool) ($user->is_verified_business ?? false),
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch business verification: ' . $e->getMessage());
            return response()->json([
                'success' => true,
                'verification' => null,
                'status' => 'none',
                'business_name' => null,
                'has_store' => false,
                'is_verified_seller' => false,
                'is_verified_business' => false,
            ]);
        }
    }

    public function submit(Request $request)
    {
        $user = $request->user();

        if (!$user->is_verified_seller) {
            return response()->json([
                'success' => false,
                'message' => 'You must complete personal verification first.',
            ], 403);
        }

        $existingPending = BusinessVerification::where('user_id', $user->id)
            ->where('status', 'pending')
            ->exists();

        if ($existingPending) {
            return response()->json([
                'success' => false,
                'message' => 'You already have a pending business verification submission.',
            ], 400);
        }

        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'cac_number' => 'required|string',
            'cac_document' => 'required|file|mimes:jpeg,png,jpg,pdf|max:10240',
            'address_document' => 'sometimes|file|mimes:jpeg,png,jpg,pdf|max:10240',
            'utility_bill' => 'sometimes|file|mimes:jpeg,png,jpg,pdf|max:10240',
            'tax_registration' => 'sometimes|file|mimes:jpeg,png,jpg,pdf|max:10240',
        ]);

        $data = [
            'user_id' => $user->id,
            'business_name' => $validated['business_name'],
            'cac_number' => $validated['cac_number'],
            'status' => 'pending',
        ];

        if ($request->hasFile('cac_document')) {
            $data['cac_document'] = Storage::disk('public')->putFile('verifications', $request->file('cac_document'));
        }

        if ($request->hasFile('address_document')) {
            $data['address_document'] = Storage::disk('public')->putFile('verifications', $request->file('address_document'));
        }

        if ($request->hasFile('utility_bill')) {
            $data['utility_bill'] = Storage::disk('public')->putFile('verifications', $request->file('utility_bill'));
        }

        if ($request->hasFile('tax_registration')) {
            $data['tax_registration'] = Storage::disk('public')->putFile('verifications', $request->file('tax_registration'));
        }

        $verification = BusinessVerification::create($data);

        Log::info('Business verification submitted', [
            'user_id' => $user->id,
            'verification_id' => $verification->id,
            'business_name' => $validated['business_name'],
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Business verification submitted for review',
            'verification' => $verification,
        ], 201);
    }

    public function getStatus(Request $request)
    {
        $user = $request->user();
        $verification = BusinessVerification::getLatestForUser($user->id);

        return response()->json([
            'is_verified_business' => (bool) ($user->is_verified_business ?? false),
            'business_name' => $verification ? $verification->business_name : null,
            'status' => $verification ? $verification->status : 'none',
            'verified_at' => $verification ? $verification->verified_at : null,
        ]);
    }

    public function uploadDocument(Request $request)
    {
        $validated = $request->validate([
            'file' => 'required|file|max:10240',
        ]);

        $path = Storage::disk('public')->putFile('verifications', $request->file('file'));

        return response()->json([
            'success' => true,
            'url' => Storage::disk('public')->url($path),
        ]);
    }
}
