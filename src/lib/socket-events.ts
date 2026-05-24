import { QueryClient } from '@tanstack/react-query';
import { adKeys } from './query-keys';
import { syncAllCaches, syncAdDetailCache } from './cache-sync';

export type ListingEventType =
  | 'ad.created'
  | 'ad.updated'
  | 'ad.deleted'
  | 'ad.restored'
  | 'ad.approved'
  | 'ad.rejected'
  | 'ad.suspended'
  | 'ad.activated'
  | 'ad.sold'
  | 'ad.available'
  | 'ad.renewed'
  | 'ad.featured'
  | 'ad.unfeatured'
  | 'ad.promoted'
  | 'ad.price_updated'
  | 'ad.images_updated'
  | 'ad.attributes_updated';

export interface ListingEvent {
  type: ListingEventType;
  adId: number;
  adSlug?: string;
  data?: Partial<any>;
  timestamp: string;
}

export function handleListingEvent(queryClient: QueryClient, event: ListingEvent): void {
  switch (event.type) {
    case 'ad.created':
    case 'ad.updated':
    case 'ad.approved':
    case 'ad.rejected':
    case 'ad.suspended':
    case 'ad.activated':
    case 'ad.sold':
    case 'ad.available':
    case 'ad.renewed':
    case 'ad.featured':
    case 'ad.unfeatured':
    case 'ad.promoted':
    case 'ad.price_updated':
    case 'ad.images_updated':
    case 'ad.attributes_updated':
      syncAllCaches(queryClient);
      if (event.adSlug) {
        syncAdDetailCache(queryClient, event.adSlug);
      }
      break;

    case 'ad.deleted':
    case 'ad.restored':
      syncAllCaches(queryClient);
      break;

    default:
      syncAllCaches(queryClient);
      break;
  }
}

export type EventHandler = (event: ListingEvent) => void;

export function createListingEventHandler(queryClient: QueryClient): EventHandler {
  return (event: ListingEvent) => {
    handleListingEvent(queryClient, event);
  };
}
