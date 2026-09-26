import { InMemoryListingRepository } from '../listings/listing.repository';
import { isPickupWindowOpen } from '../listings/listing.validation';
import { InMemoryReservationRepository } from './reservation.repository';
import { Reservation } from './reservation.types';

export type ReservationInput = {
  listingId: string;
  customerName: string;
  quantity: number;
};

export class ReservationService {
  constructor(
    private readonly repository: InMemoryReservationRepository,
    private readonly listingRepository: InMemoryListingRepository,
  ) {}

  createReservation(input: ReservationInput): Reservation {
    if (!input.listingId.trim()) throw new Error('Listing id is required');
    if (!input.customerName.trim()) throw new Error('Customer name is required');
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new Error('Quantity must be a positive whole number');
    }

    const listing = this.listingRepository.findById(input.listingId.trim());
    if (!listing) throw new Error('Listing not found');
    if (listing.status !== 'AVAILABLE') throw new Error('Listing is not available');
    if (!isPickupWindowOpen(listing)) throw new Error('Listing is outside its pickup window');
    if (input.quantity > listing.servingsAvailable) {
      throw new Error('Not enough servings available');
    }

    const sequence = this.repository.findAll().length + 1;
    const reservation = this.repository.save({
      id: `reservation-${sequence}`,
      referenceCode: `LF-${String(sequence).padStart(4, '0')}`,
      listingId: listing.id,
      listingTitle: listing.title,
      restaurantName: listing.restaurantName,
      pickupStart: listing.pickupStart,
      pickupEnd: listing.pickupEnd,
      customerName: input.customerName.trim(),
      quantity: input.quantity,
      totalPriceCents: input.quantity * listing.discountedPriceCents,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    });

    this.listingRepository.save({
      ...listing,
      servingsAvailable: listing.servingsAvailable - input.quantity,
      status: listing.servingsAvailable - input.quantity === 0 ? 'SOLD_OUT' : 'AVAILABLE',
    });

    return reservation;
  }

  getReservationByReference(referenceCode: string): Reservation | undefined {
    const normalized = referenceCode.trim().toLowerCase();
    if (!normalized) return undefined;
    return this.repository.findAll().find(
      (reservation) => reservation.referenceCode.toLowerCase() === normalized,
    );
  }

  verifyPickup(referenceCode: string): Reservation {
    const reservation = this.getReservationByReference(referenceCode);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'CONFIRMED') {
      throw new Error(`Reservation is ${reservation.status.toLowerCase()}`);
    }
    return reservation;
  }

  verifyAndCollectPickup(referenceCode: string): Reservation {
    const reservation = this.verifyPickup(referenceCode);
    const collected = { ...reservation, status: 'COLLECTED' as const };
    this.repository.save(collected);
    return collected;
  }

  getCustomerReservations(customerName: string): Reservation[] {
    return this.repository.findAll().filter(
      (reservation) => reservation.customerName.toLowerCase() === customerName.trim().toLowerCase(),
    );
  }

  getRestaurantReservations(restaurantName: string, status?: Reservation['status']): Reservation[] {
    const normalizedName = restaurantName.trim().toLowerCase();
    return this.repository.findAll()
      .filter((reservation) => reservation.restaurantName.toLowerCase() === normalizedName)
      .filter((reservation) => !status || reservation.status === status)
      .sort((a, b) => a.pickupStart.localeCompare(b.pickupStart));
  }

  getRestaurantReservationSummary(restaurantName: string): {
    confirmed: number;
    collected: number;
    cancelled: number;
    servingsDue: number;
  } {
    const reservations = this.getRestaurantReservations(restaurantName);
    return reservations.reduce((summary, reservation) => {
      summary[reservation.status.toLowerCase() as 'confirmed' | 'collected' | 'cancelled'] += 1;
      if (reservation.status === 'CONFIRMED') summary.servingsDue += reservation.quantity;
      return summary;
    }, { confirmed: 0, collected: 0, cancelled: 0, servingsDue: 0 });
  }

  cancelReservation(reservationId: string): Reservation {
    const reservation = this.repository.findById(reservationId);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'CONFIRMED') {
      throw new Error('Only confirmed reservations can be cancelled');
    }

    this.restoreServings(reservation);
    const cancelled = { ...reservation, status: 'CANCELLED' as const };
    this.repository.save(cancelled);
    return cancelled;
  }

  markCollected(reservationId: string): Reservation {
    const reservation = this.repository.findById(reservationId);
    if (!reservation) throw new Error('Reservation not found');
    if (reservation.status !== 'CONFIRMED') {
      throw new Error('Only confirmed reservations can be collected');
    }

    const collected = { ...reservation, status: 'COLLECTED' as const };
    this.repository.save(collected);
    return collected;
  }

  private restoreServings(reservation: Reservation): void {
    const listing = this.listingRepository.findById(reservation.listingId);
    if (!listing) throw new Error('Listing not found');

    this.listingRepository.save({
      ...listing,
      servingsAvailable: listing.servingsAvailable + reservation.quantity,
      status: 'AVAILABLE',
    });
  }
}
