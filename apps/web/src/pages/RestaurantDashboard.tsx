import { useMemo, useState } from 'react';
import { AvailabilityEditor } from '../components/AvailabilityEditor';
import { ListingForm } from '../components/ListingForm';
import { ReservationQueue } from '../components/ReservationQueue';
import { PickupVerifier } from '../components/PickupVerifier';
import '../styles/listing-form.css';

const listings = [
  { id: 'listing-1', title: 'Creamy mushroom pasta', servings: 8 },
  { id: 'listing-2', title: 'Roast vegetable focaccia', servings: 3 },
];

export function RestaurantDashboard() {
  const [query, setQuery] = useState('');
  const [publishedCount, setPublishedCount] = useState(0);
  const visibleListings = useMemo(() => listings.filter((listing) => listing.title.toLowerCase().includes(query.toLowerCase())), [query]);

  function publish(title: string, servings: number) {
    listings.push({ id: `listing-${listings.length + 1}`, title, servings });
    setPublishedCount((count) => count + 1);
  }

  return (
    <main className="dashboard-shell">
      <header>
        <p className="eyebrow">Restaurant workspace</p>
        <h1>Harbour Kitchen</h1>
        <p>Keep tonight’s surplus meals accurate so customers know what they can rescue.</p>
      </header>
      <ListingForm onCreate={(title, servings) => publish(title, servings)} />
      {publishedCount > 0 && <p className="dashboard-feedback" role="status">{publishedCount} new listing{publishedCount === 1 ? '' : 's'} published today.</p>}
      <label className="dashboard-search">Filter listings<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by meal name" /></label>
      <div className="dashboard-grid">
        {visibleListings.map((listing) => (
          <AvailabilityEditor key={listing.id} listingTitle={listing.title} initialServings={listing.servings} onSave={() => undefined} />
        ))}
        {visibleListings.length === 0 && <p className="empty-state">No listings match your search.</p>}
      </div>
      <ReservationQueue />
      <PickupVerifier />
    </main>
  );
}
