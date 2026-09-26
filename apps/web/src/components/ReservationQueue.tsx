import { useMemo, useState } from 'react';

type ReservationStatus = 'CONFIRMED' | 'CANCELLED' | 'COLLECTED';

type Reservation = {
  id: string;
  customerName: string;
  listingTitle: string;
  quantity: number;
  pickupTime: string;
  pickupEnd: string;
  status: ReservationStatus;
};

const seedReservations: Reservation[] = [
  { id: 'res-101', customerName: 'Mia', listingTitle: 'Creamy mushroom pasta', quantity: 2, pickupTime: '18:15', pickupEnd: '19:00', status: 'CONFIRMED' },
  { id: 'res-102', customerName: 'Daniel', listingTitle: 'Roast vegetable focaccia', quantity: 1, pickupTime: '18:30', pickupEnd: '19:15', status: 'CONFIRMED' },
  { id: 'res-103', customerName: 'Priya', listingTitle: 'Creamy mushroom pasta', quantity: 1, pickupTime: '17:45', pickupEnd: '18:30', status: 'COLLECTED' },
];

export function ReservationQueue() {
  const [statusFilter, setStatusFilter] = useState<'ALL' | ReservationStatus>('CONFIRMED');
  const [query, setQuery] = useState('');
  const [reservations, setReservations] = useState(seedReservations);

  const visibleReservations = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return reservations
      .filter((reservation) => statusFilter === 'ALL' || reservation.status === statusFilter)
      .filter((reservation) => !normalizedQuery || `${reservation.customerName} ${reservation.listingTitle}`.toLowerCase().includes(normalizedQuery));
  }, [reservations, statusFilter, query]);

  function updateStatus(id: string, status: ReservationStatus) {
    setReservations((current) => current.map((reservation) => (
      reservation.id === id ? { ...reservation, status } : reservation
    )));
  }

  const confirmedCount = reservations.filter((reservation) => reservation.status === 'CONFIRMED').length;
  const confirmedServings = reservations
    .filter((reservation) => reservation.status === 'CONFIRMED')
    .reduce((total, reservation) => total + reservation.quantity, 0);

  const urgentCount = reservations.filter((reservation) => reservation.status === 'CONFIRMED' && reservation.pickupEnd <= '18:30').length;
  const collectedCount = reservations.filter((reservation) => reservation.status === 'COLLECTED').length;
  const cancelledCount = reservations.filter((reservation) => reservation.status === 'CANCELLED').length;


  return (
    <section className="reservation-queue" aria-labelledby="reservation-queue-title">
      <div className="queue-header">
        <div>
          <p className="eyebrow">Pickup operations</p>
          <h2 id="reservation-queue-title">Reservation queue</h2>
        </div>
        <div className="queue-summary" aria-label="Confirmed pickup summary">
          <strong>{confirmedCount}</strong>
          <span>{confirmedServings} servings due{urgentCount > 0 ? ` · ${urgentCount} closing soon` : ''}</span>
        </div>
      </div>

      <div className="queue-metrics" aria-label="Reservation totals">
        <div><strong>{confirmedCount}</strong><span>Confirmed</span></div>
        <div><strong>{collectedCount}</strong><span>Collected</span></div>
        <div><strong>{cancelledCount}</strong><span>Cancelled</span></div>
      </div>

      <label className="queue-search">Search reservations
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Customer or meal" />
      </label>

      <div className="queue-filters" role="group" aria-label="Filter reservations">
        {(['CONFIRMED', 'COLLECTED', 'CANCELLED', 'ALL'] as const).map((status) => (
          <button
            key={status}
            type="button"
            className={statusFilter === status ? 'active' : ''}
            onClick={() => setStatusFilter(status)}
          >
            {status === 'ALL' ? 'All' : status[0] + status.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {visibleReservations.length === 0 ? (
        <p className="queue-empty">No reservations match this filter.</p>
      ) : (
        <div className="queue-list">
          {visibleReservations.map((reservation) => (
            <article className="queue-card" key={reservation.id}>
              <div>
                <strong>{reservation.customerName}</strong>
                <p>{reservation.listingTitle} · {reservation.quantity} serving{reservation.quantity === 1 ? '' : 's'}</p>
                <small>Pickup {reservation.pickupTime}–{reservation.pickupEnd}</small>{reservation.status === 'CONFIRMED' && reservation.pickupEnd <= '18:30' && <span className="pickup-warning">Closing soon</span>}
              </div>
              <div className="queue-actions">
                <span className={`reservation-status status-${reservation.status.toLowerCase()}`}>{reservation.status}</span>
                {reservation.status === 'CONFIRMED' && (
                  <>
                    <button type="button" onClick={() => updateStatus(reservation.id, 'COLLECTED')}>Mark collected</button>
                    <button type="button" onClick={() => updateStatus(reservation.id, 'CANCELLED')}>Cancel</button>
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
