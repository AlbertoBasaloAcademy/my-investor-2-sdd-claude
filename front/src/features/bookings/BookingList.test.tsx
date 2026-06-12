import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Booking } from '../../shared/types/bookings';
import { BookingList } from './BookingList';

const created: Booking = {
  id: 'booking-1',
  launchId: 'launch-1',
  passengerName: 'Ada Lovelace',
  passengerEmail: 'ada@example.com',
  passengerPhone: '+34 600 000 001',
  status: 'created',
};

const cancelled: Booking = { ...created, id: 'booking-2', passengerName: 'Grace Hopper', status: 'cancelled' };

test('shows an empty message when there are no bookings', () => {
  render(<BookingList bookings={[]} onCancel={vi.fn()} />);

  expect(screen.getByTestId('booking-list')).toBeInTheDocument();
  expect(screen.getByTestId('bookings-empty')).toBeInTheDocument();
});

test('renders a row per booking with status badge', () => {
  render(<BookingList bookings={[created, cancelled]} onCancel={vi.fn()} />);

  const items = screen.getAllByTestId('booking-item');
  expect(items).toHaveLength(2);
  const statuses = screen.getAllByTestId('booking-status').map((s) => s.textContent);
  expect(statuses).toEqual(['created', 'cancelled']);
});

test('marks cancelled bookings as visually distinct and hides their cancel button', () => {
  render(<BookingList bookings={[created, cancelled]} onCancel={vi.fn()} />);

  const items = screen.getAllByTestId('booking-item');
  expect(items[0]).not.toHaveClass('booking--cancelled');
  expect(items[1]).toHaveClass('booking--cancelled');
  expect(screen.getAllByTestId('booking-cancel')).toHaveLength(1);
});

test('invokes onCancel with the booking id', async () => {
  const user = userEvent.setup();
  const onCancel = vi.fn();
  render(<BookingList bookings={[created]} onCancel={onCancel} />);

  await user.click(screen.getByTestId('booking-cancel'));

  expect(onCancel).toHaveBeenCalledWith('booking-1');
});
