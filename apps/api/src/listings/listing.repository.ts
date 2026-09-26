import { FoodListing } from './listing.types';

export class InMemoryListingRepository {
  private readonly listings: FoodListing[] = [];

  constructor(seed: FoodListing[] = []) {
    this.listings = [...seed];
  }

  findAll(): FoodListing[] {
    return this.listings.map((listing) => ({ ...listing }));
  }

  findById(id: string): FoodListing | undefined {
    const listing = this.listings.find((item) => item.id === id);
    return listing ? { ...listing } : undefined;
  }

  save(listing: FoodListing): FoodListing {
    const index = this.listings.findIndex((item) => item.id === listing.id);
    if (index === -1) this.listings.push({ ...listing });
    else this.listings[index] = { ...listing };
    return { ...listing };
  }
}
