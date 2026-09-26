export type ListingStatus = 'AVAILABLE' | 'SOLD_OUT' | 'EXPIRED';

export interface FoodListing {
  id: string;
  restaurantName: string;
  title: string;
  description: string;
  originalPriceCents: number;
  discountedPriceCents: number;
  servingsAvailable: number;
  pickupStart: string;
  pickupEnd: string;
  status: ListingStatus;
}
