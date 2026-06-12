import type { Booking } from '../../shared/types/bookings';
import './BookingList.css';

export function BookingList({
  bookings,
  onCancel,
}: {
  bookings: Booking[];
  onCancel: (id: string) => void;
}) {
  return (
    <div className="booking-list" data-testid="booking-list">
      {bookings.length === 0 ? (
        <p data-testid="bookings-empty">No bookings for this launch.</p>
      ) : (
        <ul className="booking-rows">
          {bookings.map((booking) => (
            <li
              key={booking.id}
              className={`booking-item${booking.status === 'cancelled' ? ' booking--cancelled' : ''}`}
              data-testid="booking-item"
            >
              <span className="booking-passenger" data-testid="booking-passenger">
                {booking.passengerName}
              </span>
              <span className="booking-contact">
                {booking.passengerEmail} · {booking.passengerPhone}
              </span>
              <span
                className={`booking-status booking-status--${booking.status}`}
                data-testid="booking-status"
              >
                {booking.status}
              </span>
              {booking.status === 'created' && (
                <button
                  className="booking-cancel-btn"
                  onClick={() => onCancel(booking.id)}
                  data-testid="booking-cancel"
                >
                  Cancel
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
