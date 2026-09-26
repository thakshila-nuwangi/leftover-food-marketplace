import { useEffect, useState } from 'react';

type Props = {
  listingTitle: string;
  unitPrice: number;
  maxQuantity: number;
  restaurantName: string;
  pickupStart: string;
  pickupEnd: string;
  onReserve: (customerName: string, quantity: number) => void;
  confirmationCode?: string;
};

export function ReservationForm({ listingTitle, unitPrice, maxQuantity, restaurantName, pickupStart, pickupEnd, onReserve, confirmationCode }: Props) {
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setQuantity(1);
    setConfirmed(false);
  }, [listingTitle]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!customerName.trim() || quantity < 1 || quantity > maxQuantity) return;
    onReserve(customerName.trim(), quantity);
    setConfirmed(true);
  }

  return (
    <form className="reservation-card" onSubmit={submit}>
      <p className="eyebrow">Reserve surplus</p>
      <h2>{listingTitle}</h2>
      <p className="reservation-restaurant">{restaurantName}</p>
      <p className="reservation-price">NZ${unitPrice.toFixed(2)} per serving</p>
      <p className="reservation-pickup">Pickup {pickupStart}–{pickupEnd}</p>
      <label>Customer name<input value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="e.g. Thakshila" /></label>
      <label>Servings<input type="number" min={1} max={maxQuantity} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} /></label>
      <button type="submit">Reserve pickup</button>
      {confirmed && (
        <div className="reservation-success" role="status">
          <strong>Reservation confirmed</strong>
          {confirmationCode && <span>Reference: {confirmationCode}</span>}
          <span>Show this reference when you arrive for pickup.</span>
        </div>
      )}
    </form>
  );
}
