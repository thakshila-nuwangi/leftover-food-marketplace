import { useState } from 'react';

type Props = { onCreate: (title: string, servings: number, price: number) => void };

export function ListingForm({ onCreate }: Props) {
  const [title, setTitle] = useState('');
  const [servings, setServings] = useState(1);
  const [price, setPrice] = useState(7);
  const [created, setCreated] = useState(false);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim() || servings < 1 || price <= 0) return;
    onCreate(title.trim(), servings, price);
    setCreated(true);
    setTitle('');
  }

  return (
    <form className="listing-form" onSubmit={submit}>
      <div>
        <p className="eyebrow">Quick publish</p>
        <h2>Add surplus food</h2>
      </div>
      <label>Meal name<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Vegetable curry box" /></label>
      <div className="form-row">
        <label>Servings<input type="number" min={1} value={servings} onChange={(e) => setServings(Number(e.target.value))} /></label>
        <label>Price (NZD)<input type="number" min={1} step={0.5} value={price} onChange={(e) => setPrice(Number(e.target.value))} /></label>
      </div>
      <button type="submit">Publish listing</button>
      {created && <small role="status">Listing ready for review</small>}
    </form>
  );
}
