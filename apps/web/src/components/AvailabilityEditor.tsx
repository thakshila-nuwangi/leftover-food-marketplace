import { useState } from 'react';

type Props = { listingTitle: string; initialServings: number; onSave: (value: number) => void };

export function AvailabilityEditor({ listingTitle, initialServings, onSave }: Props) {
  const [servings, setServings] = useState(initialServings);
  const [saved, setSaved] = useState(false);

  function save() {
    onSave(servings);
    setSaved(true);
  }

  return (
    <section aria-label={`Availability for ${listingTitle}`} className="availability-editor">
      <div>
        <strong>{listingTitle}</strong>
        <span>{servings} servings available</span>
      </div>
      <label>
        Servings
        <input type="number" min={0} value={servings} onChange={(event) => setServings(Number(event.target.value))} />
      </label>
      <button type="button" onClick={save}>Save availability</button>
      {saved && <small role="status">Availability updated</small>}
    </section>
  );
}
