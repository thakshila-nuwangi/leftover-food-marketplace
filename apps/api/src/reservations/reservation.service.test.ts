import { InMemoryListingRepository } from '../listings/listing.repository';
import { InMemoryReservationRepository } from './reservation.repository';
import { ReservationService } from './reservation.service';
import { FoodListing } from '../listings/listing.types';

const listing: FoodListing = {
  id: 'listing-1',
  restaurantName: 'Harbour Kitchen',
  title: 'Creamy mushroom pasta',
  description: 'Freshly cooked pasta box',
  originalPriceCents: 1200,
  discountedPriceCents: 750,
  servingsAvailable: 4,
  pickupStart: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  pickupEnd: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
  status: 'AVAILABLE',
};

describe('ReservationService', () => {
  function createService() {
    return new ReservationService(
      new InMemoryReservationRepository(),
      new InMemoryListingRepository([listing]),
    );
  }

  it('creates a confirmed reservation using the listing price and reduces availability', () => {
    const service = createService();
    const reservation = service.createReservation({
      listingId: 'listing-1', customerName: '  Ana  ', quantity: 2,
    });

    expect(reservation.customerName).toBe('Ana');
    expect(reservation.referenceCode).toBe('LF-0001');
    expect(reservation.listingTitle).toBe('Creamy mushroom pasta');
    expect(reservation.restaurantName).toBe('Harbour Kitchen');
    expect(reservation.totalPriceCents).toBe(1500);
    expect(reservation.status).toBe('CONFIRMED');
  });

  it('rejects reservations above remaining availability', () => {
    const service = createService();
    expect(() => service.createReservation({
      listingId: 'listing-1', customerName: 'Ana', quantity: 5,
    })).toThrow('Not enough servings available');
  });

  it('marks a listing sold out when the last servings are reserved', () => {
    const listingRepository = new InMemoryListingRepository([listing]);
    const service = new ReservationService(new InMemoryReservationRepository(), listingRepository);

    service.createReservation({ listingId: 'listing-1', customerName: 'Ana', quantity: 4 });

    expect(listingRepository.findById('listing-1')).toMatchObject({
      servingsAvailable: 0,
      status: 'SOLD_OUT',
    });
  });

  it('restores availability when a confirmed reservation is cancelled', () => {
    const listingRepository = new InMemoryListingRepository([listing]);
    const service = new ReservationService(new InMemoryReservationRepository(), listingRepository);
    const reservation = service.createReservation({ listingId: 'listing-1', customerName: 'Ana', quantity: 2 });

    expect(service.cancelReservation(reservation.id).status).toBe('CANCELLED');
    expect(listingRepository.findById('listing-1')).toMatchObject({ servingsAvailable: 4, status: 'AVAILABLE' });
  });



  it('looks up a reservation by reference and only verifies confirmed pickups', () => {
    const service = createService();
    const reservation = service.createReservation({ listingId: 'listing-1', customerName: 'Ana', quantity: 1 });

    expect(service.getReservationByReference(`  ${reservation.referenceCode.toLowerCase()} `)).toMatchObject({
      referenceCode: 'LF-0001',
      customerName: 'Ana',
      status: 'CONFIRMED',
    });
    expect(service.verifyPickup(reservation.referenceCode).listingTitle).toBe('Creamy mushroom pasta');
  });

  it('rejects pickup verification for cancelled reservations', () => {
    const service = createService();
    const reservation = service.createReservation({ listingId: 'listing-1', customerName: 'Ana', quantity: 1 });
    service.cancelReservation(reservation.id);

    expect(() => service.verifyPickup(reservation.referenceCode)).toThrow('Reservation is cancelled');
  });

  it('does not restore availability when a reservation is collected', () => {
    const listingRepository = new InMemoryListingRepository([listing]);
    const service = new ReservationService(new InMemoryReservationRepository(), listingRepository);
    const reservation = service.createReservation({ listingId: 'listing-1', customerName: 'Ana', quantity: 1 });

    expect(service.markCollected(reservation.id).status).toBe('COLLECTED');
    expect(listingRepository.findById('listing-1')?.servingsAvailable).toBe(3);
  });
});

  it('rejects reservations outside the pickup window', () => {
    const closedListing = { ...listing, pickupStart: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), pickupEnd: new Date(Date.now() - 60 * 60 * 1000).toISOString() };
    const service = new ReservationService(new InMemoryReservationRepository(), new InMemoryListingRepository([closedListing]));
    expect(() => service.createReservation({ listingId: 'listing-1', customerName: 'Ana', quantity: 1 })).toThrow('outside its pickup window');
  });


describe('pickup collection', () => {
  it('marks a verified reservation as collected', () => {
    const reservation = service.createReservation({ listingId: 'listing-1', customerName: 'Ada', quantity: 1 });

    const collected = service.verifyAndCollectPickup(reservation.referenceCode);

    expect(collected.status).toBe('COLLECTED');
    expect(service.getReservationByReference(reservation.referenceCode)?.status).toBe('COLLECTED');
  });

  it('does not collect an already collected reservation', () => {
    const reservation = service.createReservation({ listingId: 'listing-1', customerName: 'Ada', quantity: 1 });
    service.markCollected(reservation.id);

    expect(() => service.verifyAndCollectPickup(reservation.referenceCode)).toThrow('Reservation is collected');
  });
});


  it('returns restaurant reservations filtered by status and pickup order', () => {
    const service = createService();
    const first = service.createReservation({ listingId: 'listing-1', customerName: 'Ana', quantity: 1 });
    const second = service.createReservation({ listingId: 'listing-1', customerName: 'Ben', quantity: 1 });
    service.markCollected(second.id);

    expect(service.getRestaurantReservations('harbour kitchen', 'CONFIRMED').map((reservation) => reservation.id)).toEqual([first.id]);
    expect(service.getRestaurantReservationSummary('Harbour Kitchen')).toEqual({
      confirmed: 1, collected: 1, cancelled: 0, servingsDue: 1,
    });
  });
