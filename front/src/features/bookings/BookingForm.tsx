import { useState } from 'react';
import type { BookingRequest } from '../../shared/types/bookings';
import './BookingForm.css';

const emptyForm: BookingRequest = { passengerName: '', passengerEmail: '', passengerPhone: '' };

export function BookingForm({ onSubmit }: { onSubmit: (request: BookingRequest) => Promise<void> }) {
  const [form, setForm] = useState<BookingRequest>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isComplete =
    form.passengerName.trim() !== '' &&
    form.passengerEmail.trim() !== '' &&
    form.passengerPhone.trim() !== '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(form);
      setForm(emptyForm);
    } catch (cause: unknown) {
      setFormError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="booking-form" onSubmit={handleSubmit} data-testid="booking-form">
      <div className="booking-form-row">
        <label htmlFor="booking-name">Passenger Name</label>
        <input
          id="booking-name"
          type="text"
          value={form.passengerName}
          onChange={(e) => setForm({ ...form, passengerName: e.target.value })}
          required
          data-testid="booking-name"
        />
      </div>
      <div className="booking-form-row">
        <label htmlFor="booking-email">Passenger Email</label>
        <input
          id="booking-email"
          type="email"
          value={form.passengerEmail}
          onChange={(e) => setForm({ ...form, passengerEmail: e.target.value })}
          required
          data-testid="booking-email"
        />
      </div>
      <div className="booking-form-row">
        <label htmlFor="booking-phone">Passenger Phone</label>
        <input
          id="booking-phone"
          type="tel"
          value={form.passengerPhone}
          onChange={(e) => setForm({ ...form, passengerPhone: e.target.value })}
          required
          data-testid="booking-phone"
        />
      </div>
      {formError && (
        <p className="booking-form-error" role="alert" data-testid="booking-form-error">
          {formError}
        </p>
      )}
      <div className="booking-form-actions">
        <button type="submit" disabled={!isComplete || isSubmitting} data-testid="booking-submit">
          Book
        </button>
      </div>
    </form>
  );
}
