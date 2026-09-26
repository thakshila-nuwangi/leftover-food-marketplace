import { FoodListing } from './listing.types';

export function validatePickupWindow(pickupStart: string, pickupEnd: string): void {
  const start = new Date(pickupStart).getTime();
  const end = new Date(pickupEnd).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    throw new Error('Pickup end must be after pickup start');
  }
}

export function isPickupWindowOpen(listing: FoodListing, now = new Date()): boolean {
  const current = now.getTime();
  return current >= new Date(listing.pickupStart).getTime() && current <= new Date(listing.pickupEnd).getTime();
}
