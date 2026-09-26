import { useState } from 'react';

type PickupReservation = {
  referenceCode: string;
  listingTitle: string;
  restaurantName: string;
  customerName: string;
  quantity: number;
  pickupStart: string;
  pickupEnd: string;
  status: 'CONFIRMED' | 'CANCELLED' | 'COLLECTED';
};

const demoReservations: PickupReservation[] = [
  {
    referenceCode: 'LF-0001',
    listingTitle: 'Creamy mushroom pasta',
    restaurantName: 'Harbour Kitchen',
    customerName: 'Ana Perera',
    quantity: 2,
    pickupStart: '5:30 PM',
    pickupEnd: '6:30 PM',
    status: 'CONFIRMED',
  },
];

export function PickupVerifier() {
  const [reference, setReference] = useState('');
  const [verified, setVerified] = useState<PickupReservation | null>(null);
  const [message, setMessage] = useState('');
  const [collected, setCollected] = useState(false);

  function verify(event: React.FormEvent) {
    event.preventDefault();
    const match = demoReservations.find((reservation) => reservation.referenceCode.toLowerCase() === reference.trim().toLowerCase());
    setVerified(match ?? null);
    setCollected(false);
    setMessage(match ? 'Reservation verified. Check the order before handing it over.' : 'No confirmed reservation found for that reference.');
  }

  function markCollected() {
    if (!verified) return;
    setCollected(true);
    setMessage('Pickup completed. Reservation marked as collected.');
  }

  return (
    <section className="pickup-verifier" aria-labelledby="pickup-verifier-title">
      <div>
        <p className="eyebrow">Pickup desk</p>
        <h2 id="pickup-verifier-title">Verify a customer reservation</h2>
        <p className="muted-copy">Use the reference from the customer receipt before marking an order collected.</p>
      </div>
      <form className="pickup-verifier-form" onSubmit={verify}>
        <label>
          Reservation reference
          <input value={reference} onChange={(event) => setReference(event.target.value)} placeholder="e.g. LF-0001" />
        </label>
        <button type="submit">Verify pickup</button>
      </form>
      {message && <p className={verified ? 'pickup-success' : 'pickup-error'} role="status">{message}</p>}
      {verified && (
        <div className="pickup-result">
          <div><span>Customer</span><strong>{verified.customerName}</strong></div>
          <div><span>Meal</span><strong>{verified.listingTitle}</strong></div>
          <div><span>Servings</span><strong>{verified.quantity}</strong></div>
          <div><span>Pickup window</span><strong>{verified.pickupStart}–{verified.pickupEnd}</strong></div>
          <div><span>Reference</span><strong>{verified.referenceCode}</strong></div>
          <div><span>Status</span><strong>{collected ? 'COLLECTED' : verified.status}</strong></div>
        </div>
      )}
      {verified && !collected && (
        <button className="pickup-collect-button" type="button" onClick={markCollected}>
          Mark as collected
        </button>
      )}
      {verified && collected && (
        <p className="pickup-collected" role="status">Ready for the next customer.</p>
      )}
    </section>
  );
}
