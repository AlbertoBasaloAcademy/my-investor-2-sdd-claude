import { afterEach, describe, expect, it, vi } from 'vitest';
import { httpClient } from '../../shared/api/httpClient';
import type { Booking } from '../../shared/types/bookings';
import { cancelBooking, createBooking, getBookingsByLaunch } from './bookingsApi';

vi.mock('../../shared/api/httpClient');

const mockBooking: Booking = {
  id: 'booking-1',
  launchId: 'launch-1',
  passengerName: 'Ada Lovelace',
  passengerEmail: 'ada@example.com',
  passengerPhone: '+34 600 000 001',
  status: 'created',
};

describe('bookingsApi', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('fetches bookings for a launch', async () => {
    vi.mocked(httpClient.get).mockResolvedValue([mockBooking]);

    const result = await getBookingsByLaunch('launch-1');

    expect(result).toEqual([mockBooking]);
    expect(httpClient.get).toHaveBeenCalledWith('/api/launches/launch-1/bookings');
  });

  it('creates a booking', async () => {
    vi.mocked(httpClient.post).mockResolvedValue(mockBooking);

    const result = await createBooking('launch-1', {
      passengerName: 'Ada Lovelace',
      passengerEmail: 'ada@example.com',
      passengerPhone: '+34 600 000 001',
    });

    expect(result).toEqual(mockBooking);
    expect(httpClient.post).toHaveBeenCalledWith(
      '/api/launches/launch-1/bookings',
      expect.objectContaining({ passengerName: 'Ada Lovelace' }),
    );
  });

  it('cancels a booking', async () => {
    const cancelled: Booking = { ...mockBooking, status: 'cancelled' };
    vi.mocked(httpClient.patch).mockResolvedValue(cancelled);

    const result = await cancelBooking('booking-1');

    expect(result).toEqual(cancelled);
    expect(httpClient.patch).toHaveBeenCalledWith('/api/bookings/booking-1/cancel', {});
  });
});
