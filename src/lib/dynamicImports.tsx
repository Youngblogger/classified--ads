import dynamic from 'next/dynamic';

const LoadingPlaceholder = () => (
  <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
);

const ReviewsLoadingPlaceholder = () => (
  <div className="h-48 bg-gray-100 rounded-lg animate-pulse" />
);

export const DynamicChatModal = dynamic(
  () => import('@/components/chat/ChatModal'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicCategoryPopup = dynamic(
  () => import('@/components/ui/CategoryPopup'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicLoginModal = dynamic(
  () => import('@/components/ui/LoginModal'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicRegisterModal = dynamic(
  () => import('@/components/ui/RegisterModal'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicLocationModal = dynamic(
  () => import('@/components/ui/LocationModal'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicOtpModal = dynamic(
  () => import('@/components/ui/OtpModal'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicShareModal = dynamic(
  () => import('@/components/ui/ShareModal'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicSellerReviewModal = dynamic(
  () => import('@/components/reviews/SellerReviewModal'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicWriteReviewModal = dynamic(
  () => import('@/components/reviews/WriteReviewModal'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicBatchPostAds = dynamic(
  () => import('@/components/social/BatchPostAds'),
  { 
    ssr: false,
    loading: () => null,
  }
);

export const DynamicRelatedAds = dynamic(
  () => import('@/components/ads/RelatedAds'),
  { 
    ssr: false,
    loading: () => <LoadingPlaceholder />,
  }
);

export const DynamicLatestReviews = dynamic(
  () => import('@/components/reviews/LatestReviews'),
  { 
    ssr: false,
    loading: () => <ReviewsLoadingPlaceholder />,
  }
);
