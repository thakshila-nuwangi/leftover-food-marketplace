export type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'COLLECTED';

export interface Reservation {
  id: string;
  referenceCode: string;
  listingId: string;
  listingTitle: string;
  restaurantName: string;
  pickupStart: string;
  pickupEnd: string;
  customerName: string;
  quantity: number;
  totalPriceCents: number;
  status: ReservationStatus;
  createdAt: string;
}
