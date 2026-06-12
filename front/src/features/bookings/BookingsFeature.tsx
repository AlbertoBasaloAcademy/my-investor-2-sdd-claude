import { useState } from 'react';
import { useBookings } from './useBookings';
import { BookingForm } from './BookingForm';
import { BookingList } from './BookingList';
import type { Launch } from '../../shared/types/launches';
import './BookingsFeature.css';

export function BookingsFeature({ launches }: { launches: Launch[] }) {
  const [selectedLaunchId, setSelectedLaunchId] = useState('');
  const launchId = selectedLaunchId === '' ? null : selectedLaunchId;
  const { bookings, create, cancel, loading, error } = useBookings(launchId);
  const [actionError, setActionError] = useState<string | null>(null);

  function handleCancel(id: string) {
    setActionError(null);
    cancel(id).catch((cause: unknown) => {
      setActionError(cause instanceof Error ? cause.message : String(cause));
    });
  }

  return (
    <section className="bookings-feature" data-testid="bookings-feature">
      <h2>Bookings</h2>
      <div className="bookings-launch-row">
        <label htmlFor="booking-launch">Launch</label>
        <select
          id="booking-launch"
          value={selectedLaunchId}
          onChange={(e) => {
            setSelectedLaunchId(e.target.value);
            setActionError(null);
          }}
          data-testid="booking-launch-select"
        >
          <option value="">Select a launch…</option>
          {launches.map((launch) => (
            <option key={launch.id} value={launch.id}>
              {launch.rocketName} — {new Date(launch.scheduledAt).toLocaleString()}
            </option>
          ))}
        </select>
      </div>

      {launchId && (
        <>
          {loading ? (
            <p data-testid="bookings-loading">Loading bookings…</p>
          ) : error ? (
            <p className="bookings-error" role="alert" data-testid="bookings-error">
              {error}
            </p>
          ) : (
            <BookingList bookings={bookings} onCancel={handleCancel} />
          )}
          {actionError && (
            <p className="bookings-error" role="alert" data-testid="bookings-action-error">
              {actionError}
            </p>
          )}
          <BookingForm onSubmit={create} />
        </>
      )}
    </section>
  );
}
