import { InMemoryListingRepository } from './listing.repository';
import { ListingService } from './listing.service';

describe('ListingService', () => {
  it('returns available marketplace listings sorted by discounted price', () => {
    const service = new ListingService(new InMemoryListingRepository([
      { id: '1', restaurantName: 'Green Bowl', title: 'Curry', description: 'Mild vegetable curry', originalPriceCents: 1500, discountedPriceCents: 800, servingsAvailable: 2, pickupStart: '17:00', pickupEnd: '19:00', status: 'AVAILABLE' },
      { id: '2', restaurantName: 'Pasta Lab', title: 'Pasta', description: 'Creamy pasta', originalPriceCents: 1400, discountedPriceCents: 600, servingsAvailable: 1, pickupStart: '17:00', pickupEnd: '19:00', status: 'AVAILABLE' },
      { id: '3', restaurantName: 'Closed Cafe', title: 'Soup', description: 'Daily soup', originalPriceCents: 1000, discountedPriceCents: 400, servingsAvailable: 0, pickupStart: '17:00', pickupEnd: '19:00', status: 'SOLD_OUT' },
    ]));

    expect(service.getMarketplaceListings({ search: 'pasta' }).map((listing) => listing.id)).toEqual(['2']);
    expect(service.getMarketplaceListings().map((listing) => listing.id)).toEqual(['2', '1']);
  });

  it('filters by restaurant and price ceiling', () => {
    const service = new ListingService(new InMemoryListingRepository([
      { id: '1', restaurantName: 'Green Bowl', title: 'Curry', description: 'Mild vegetable curry', originalPriceCents: 1500, discountedPriceCents: 800, servingsAvailable: 2, pickupStart: '17:00', pickupEnd: '19:00', status: 'AVAILABLE' },
      { id: '2', restaurantName: 'Pasta Lab', title: 'Pasta', description: 'Creamy pasta', originalPriceCents: 1400, discountedPriceCents: 600, servingsAvailable: 1, pickupStart: '17:00', pickupEnd: '19:00', status: 'AVAILABLE' },
    ]));

    expect(service.getMarketplaceListings({ restaurantName: 'green', maxPriceCents: 800 }).map((listing) => listing.id)).toEqual(['1']);
  });
});


  it('can restrict marketplace results to an active pickup window', () => {
    const service = new ListingService(new InMemoryListingRepository([
      { id: '1', restaurantName: 'Open Cafe', title: 'Rice bowl', description: 'Warm rice bowl', originalPriceCents: 1200, discountedPriceCents: 700, servingsAvailable: 2, pickupStart: '17:00', pickupEnd: '19:00', status: 'AVAILABLE' },
      { id: '2', restaurantName: 'Later Cafe', title: 'Noodles', description: 'Fresh noodles', originalPriceCents: 1300, discountedPriceCents: 650, servingsAvailable: 2, pickupStart: '20:00', pickupEnd: '21:00', status: 'AVAILABLE' },
    ]));

    expect(service.getMarketplaceListings({ currentTime: '18:15' }).map((listing) => listing.id)).toEqual(['1']);
    expect(service.getMarketplaceListings({ currentTime: '21:30' })).toEqual([]);
  });


  it('publishes and unpublishes a listing without changing its inventory', () => {
    const repository = new InMemoryListingRepository([
      { id: '1', restaurantName: 'Green Bowl', title: 'Curry', description: 'Mild vegetable curry', originalPriceCents: 1500, discountedPriceCents: 800, servingsAvailable: 2, pickupStart: '17:00', pickupEnd: '19:00', status: 'AVAILABLE' },
    ]);
    const service = new ListingService(repository);

    const expired = service.updateStatus('1', 'EXPIRED');
    expect(expired.status).toBe('EXPIRED');
    expect(expired.servingsAvailable).toBe(2);
    expect(service.getMarketplaceListings()).toEqual([]);

    const republished = service.updateStatus('1', 'AVAILABLE');
    expect(republished.status).toBe('AVAILABLE');
    expect(republished.servingsAvailable).toBe(2);
  });

  it('rejects publishing a sold-out listing', () => {
    const service = new ListingService(new InMemoryListingRepository([
      { id: '1', restaurantName: 'Green Bowl', title: 'Curry', description: 'Mild vegetable curry', originalPriceCents: 1500, discountedPriceCents: 800, servingsAvailable: 0, pickupStart: '17:00', pickupEnd: '19:00', status: 'SOLD_OUT' },
    ]));

    expect(() => service.updateStatus('1', 'AVAILABLE')).toThrow('Cannot publish a listing with no servings');
  });
