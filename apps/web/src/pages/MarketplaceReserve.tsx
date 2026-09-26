import { useState } from 'react';
import { ReservationForm } from '../components/ReservationForm';
import { MarketplaceBrowser } from '../components/MarketplaceBrowser';
import '../styles/reservation.css';

type Reservation = {
  id: number;
  referenceCode: string;
  customerName: string;
  restaurantName: string;
  listingTitle: string;
  pickupStart: string;
  pickupEnd: string;
  quantity: number;
  total: number;
  status: 'CONFIRMED' | 'CANCELLED' | 'COLLECTED';
};

export function MarketplaceReserve() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedListing, setSelectedListing] = useState({ title: 'Creamy mushroom pasta', restaurantName: 'Harbour Kitchen', unitPrice: 7.5, maxQuantity: 4, pickupStart: '17:30', pickupEnd: '19:00' });

  const listings = [
    { id: '1', restaurantName: 'Harbour Kitchen', title: 'Creamy mushroom pasta', description: 'Comforting pasta prepared for tonight's pickup window.', discountedPriceCents: 750, servingsAvailable: 4, pickupStart: '17:30', pickupEnd: '19:00' },
    { id: '2', restaurantName: 'Green Bowl', title: 'Vegetable curry with rice', description: 'Mild curry with seasonal vegetables and steamed rice.', discountedPriceCents: 650, servingsAvailable: 3, pickupStart: '18:00', pickupEnd: '19:30' },
    { id: '3', restaurantName: 'Pasta Lab', title: 'Tomato basil pasta', description: 'Fresh tomato sauce, basil, and parmesan.', discountedPriceCents: 550, servingsAvailable: 2, pickupStart: '17:00', pickupEnd: '18:30' },
  ];

  function addReservation(customerName: string, quantity: number) {
    setReservations((current) => [
      ...current,
      {
        id: Date.now(),
        referenceCode: `LF-${String(current.length + 1).padStart(4, '0')}`,
        customerName,
        restaurantName: selectedListing.restaurantName,
        listingTitle: selectedListing.title,
        pickupStart: selectedListing.pickupStart,
        pickupEnd: selectedListing.pickupEnd,
        quantity,
        total: quantity * selectedListing.unitPrice,
        status: 'CONFIRMED',
      },
    ]);
  }

  function updateReservation(id: number, status: Reservation['status']) {
    setReservations((current) => current.map((reservation) => (
      reservation.id === id ? { ...reservation, status } : reservation
    )));
  }

  return (
    <main className="marketplace-shell">
      <header>
        <p className="eyebrow">Customer marketplace</p>
        <h1>Rescue dinner before it goes to waste.</h1>
        <p>Choose a discounted meal, reserve the servings you need, and collect it during the pickup window.</p>
      </header>
      <MarketplaceBrowser
        listings={listings}
        onSelect={(listing) => setSelectedListing({ title: listing.title, restaurantName: listing.restaurantName, unitPrice: listing.discountedPriceCents / 100, maxQuantity: listing.servingsAvailable, pickupStart: listing.pickupStart, pickupEnd: listing.pickupEnd })}
      />
      <ReservationForm
        listingTitle={selectedListing.title}
        unitPrice={selectedListing.unitPrice}
        maxQuantity={selectedListing.maxQuantity}
        restaurantName={selectedListing.restaurantName}
        pickupStart={selectedListing.pickupStart}
        pickupEnd={selectedListing.pickupEnd}
        onReserve={addReservation}
        confirmationCode={reservations.at(-1)?.referenceCode}
      />
      <section className="reservation-history" aria-labelledby="reservation-history-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Your pickups</p>
            <h2 id="reservation-history-title">Reservation history</h2>
          </div>
          <span className="reservation-count">{reservations.length}</span>
        </div>
        {reservations.length === 0 ? (
          <p className="reservation-empty">Your confirmed pickups will appear here.</p>
        ) : (
          <div className="reservation-list">
            {reservations.map((reservation) => (
              <article className="reservation-history-card" key={reservation.id}>
                <div>
                  <strong>{reservation.listingTitle}</strong>
                  <p>{reservation.restaurantName} · {reservation.quantity} serving{reservation.quantity === 1 ? '' : 's'} · NZ${reservation.total.toFixed(2)}</p>
                  <small>Ref {reservation.referenceCode} · Pickup {reservation.pickupStart}–{reservation.pickupEnd}</small>
                </div>
                <div className="reservation-actions">
                  <span className={`reservation-status status-${reservation.status.toLowerCase()}`}>{reservation.status}</span>
                  {reservation.status === 'CONFIRMED' && (
                    <button type="button" onClick={() => updateReservation(reservation.id, 'CANCELLED')}>Cancel</button>
                  )}
                  {reservation.status === 'CONFIRMED' && (
                    <button type="button" onClick={() => updateReservation(reservation.id, 'COLLECTED')}>Mark collected</button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
