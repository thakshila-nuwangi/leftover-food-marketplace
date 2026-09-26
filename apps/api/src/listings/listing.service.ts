import { InMemoryListingRepository } from './listing.repository';
import { FoodListing } from './listing.types';
import { validatePickupWindow } from './listing.validation';

export interface MarketplaceListingFilters {
  search?: string;
  restaurantName?: string;
  maxPriceCents?: number;
  currentTime?: string;
}

export class ListingService {
  constructor(private readonly repository: InMemoryListingRepository) {}

  getRestaurantListings(restaurantName: string): FoodListing[] {
    return this.repository
      .findAll()
      .filter((listing) => listing.restaurantName.toLowerCase() === restaurantName.toLowerCase());
  }

  getMarketplaceListings(filters: MarketplaceListingFilters = {}): FoodListing[] {
    const search = filters.search?.trim().toLowerCase();
    const restaurantName = filters.restaurantName?.trim().toLowerCase();

    return this.repository.findAll()
      .filter((listing) => listing.status === 'AVAILABLE' && listing.servingsAvailable > 0)
      .filter((listing) => !filters.currentTime || this.isPickupWindowOpen(listing, filters.currentTime))
      .filter((listing) => !search || `${listing.title} ${listing.description}`.toLowerCase().includes(search))
      .filter((listing) => !restaurantName || listing.restaurantName.toLowerCase().includes(restaurantName))
      .filter((listing) => filters.maxPriceCents === undefined || listing.discountedPriceCents <= filters.maxPriceCents)
      .sort((a, b) => a.discountedPriceCents - b.discountedPriceCents);
  }

  isPickupWindowOpen(listing: FoodListing, currentTime: string): boolean {
    return currentTime >= listing.pickupStart && currentTime <= listing.pickupEnd;
  }

  createListing(input: Omit<FoodListing, 'status'>): FoodListing {
    if (input.servingsAvailable <= 0) throw new Error('At least one serving is required');
    if (input.discountedPriceCents >= input.originalPriceCents) throw new Error('Discounted price must be lower');
    validatePickupWindow(input.pickupStart, input.pickupEnd);
    return this.repository.save({ ...input, status: 'AVAILABLE' });
  }

  updateAvailability(id: string, servingsAvailable: number): FoodListing {
    const listing = this.repository.findById(id);
    if (!listing) throw new Error('Listing not found');
    if (!Number.isInteger(servingsAvailable) || servingsAvailable < 0) {
      throw new Error('Servings must be a non-negative whole number');
    }
    const updated = {
      ...listing,
      servingsAvailable,
      status: servingsAvailable === 0 ? 'SOLD_OUT' : 'AVAILABLE',
    } as FoodListing;
    return this.repository.save(updated);
  }

  updateStatus(id: string, status: 'AVAILABLE' | 'EXPIRED'): FoodListing {
    const listing = this.repository.findById(id);
    if (!listing) throw new Error('Listing not found');
    if (status === 'AVAILABLE' && listing.servingsAvailable === 0) {
      throw new Error('Cannot publish a listing with no servings');
    }
    return this.repository.save({ ...listing, status });
  }

  getRestaurantListingSummary(restaurantName: string): {
    total: number;
    available: number;
    soldOut: number;
    expired: number;
    servingsAvailable: number;
  } {
    const listings = this.getRestaurantListings(restaurantName);
    return listings.reduce((summary, listing) => {
      summary.total += 1;
      summary[listing.status === 'AVAILABLE' ? 'available' : listing.status === 'SOLD_OUT' ? 'soldOut' : 'expired'] += 1;
      summary.servingsAvailable += listing.servingsAvailable;
      return summary;
    }, { total: 0, available: 0, soldOut: 0, expired: 0, servingsAvailable: 0 });
  }
}
