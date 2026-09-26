import { useMemo, useState } from 'react';

type Listing = {
  id: string;
  restaurantName: string;
  title: string;
  description: string;
  discountedPriceCents: number;
  servingsAvailable: number;
  pickupStart: string;
  pickupEnd: string;
};

type Props = {
  listings: Listing[];
  onSelect: (listing: Listing) => void;
};

export function MarketplaceBrowser({ listings, onSelect }: Props) {
  const [search, setSearch] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const restaurants = useMemo(() => Array.from(new Set(listings.map((listing) => listing.restaurantName))), [listings]);
  const filteredListings = useMemo(() => listings.filter((listing) => {
    const matchesSearch = `${listing.title} ${listing.description}`.toLowerCase().includes(search.trim().toLowerCase());
    const matchesRestaurant = !restaurant || listing.restaurantName === restaurant;
    const matchesPrice = !maxPrice || listing.discountedPriceCents <= Number(maxPrice) * 100;
    return matchesSearch && matchesRestaurant && matchesPrice;
  }), [listings, maxPrice, restaurant, search]);

  return (
    <section className="marketplace-browser" aria-labelledby="available-listings-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Available near closing time</p>
          <h2 id="available-listings-title">Browse rescued meals</h2>
        </div>
        <span className="reservation-count">{filteredListings.length}</span>
      </div>
      <div className="marketplace-filters">
        <label>Search<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="pasta, curry..." /></label>
        <label>Restaurant<select value={restaurant} onChange={(event) => setRestaurant(event.target.value)}><option value="">All restaurants</option>{restaurants.map((name) => <option key={name} value={name}>{name}</option>)}</select></label>
        <label>Max price (NZD)<input type="number" min="0" step="0.50" value={maxPrice} onChange={(event) => setMaxPrice(event.target.value)} placeholder="10.00" /></label>
      </div>
      {filteredListings.length === 0 ? <p className="reservation-empty">No matching surplus meals right now.</p> : <div className="marketplace-grid">{filteredListings.map((listing) => <article className="listing-card" key={listing.id}><div><p className="eyebrow">{listing.restaurantName}</p><h3>{listing.title}</h3><p>{listing.description}</p></div><div className="listing-card-footer"><strong>NZ${(listing.discountedPriceCents / 100).toFixed(2)}</strong><span>{listing.servingsAvailable} left · {listing.pickupStart}–{listing.pickupEnd}</span><button type="button" onClick={() => onSelect(listing)}>Reserve</button></div></article>)}</div>}
    </section>
  );
}
