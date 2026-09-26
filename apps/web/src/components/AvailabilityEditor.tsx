import { useState } from 'react';

type ListingStatus = 'AVAILABLE' | 'SOLD_OUT' | 'EXPIRED';
type Props = {
  listingTitle: string;
  initialServings: number;
  initialStatus?: ListingStatus;
  onSave: (value: number) => void;
  onStatusChange?: (status: 'AVAILABLE' | 'EXPIRED') => void;
};

export function AvailabilityEditor({ listingTitle, initialServings, initialStatus = 'AVAILABLE', onSave, onStatusChange }: Props) {
  const [servings, setServings] = useState(initialServings);
  const [status, setStatus] = useState<ListingStatus>(initialStatus);
  const [saved, setSaved] = useState(false);

  function save() {
    onSave(servings);
    setSaved(true);
  }

  function togglePublished() {
    const nextStatus = status === 'AVAILABLE' ? 'EXPIRED' : 'AVAILABLE';
    if (nextStatus === 'AVAILABLE' && servings === 0) return;
    setStatus(nextStatus);
    onStatusChange?.(nextStatus);
    setSaved(false);
  }

  return (
    <section aria-label={`Availability for ${listingTitle}`} className="availability-editor">
      <div>
        <strong>{listingTitle}</strong>
        <span>{servings} servings available</span>
        <small className={`listing-status status-${status.toLowerCase()}`}>{status === 'AVAILABLE' ? 'Published' : status === 'EXPIRED' ? 'Hidden from marketplace' : 'Sold out'}</small>
      </div>
      <label>
        Servings
        <input type="number" min={0} value={servings} onChange={(event) => { setServings(Number(event.target.value)); setSaved(false); }} />
      </label>
      <div className="availability-actions">
        <button type="button" onClick={save}>Save availability</button>
        {status !== 'SOLD_OUT' && <button type="button" className="secondary-action" onClick={togglePublished}>{status === 'AVAILABLE' ? 'Hide listing' : 'Publish listing'}</button>}
      </div>
      {saved && <small role="status">Availability updated</small>}
    </section>
  );
}
