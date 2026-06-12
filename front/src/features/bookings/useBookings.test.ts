import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Booking } from '../../shared/types/bookings';
import * as bookingsApi from './bookingsApi';
import { useBookings } from './useBookings';

vi.mock('./bookingsApi');

const mockBooking: Booking = {
  id: 'booking-1',
  launchId: 'launch-1',
  passengerName: 'Ada Lovelace',
  passengerEmail: 'ada@example.com',
  passengerPhone: '+34 600 000 001',
  status: 'created',
};

describe('useBookings', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('does not fetch when launchId is null', () => {
    const { result } = renderHook(() => useBookings(null));

    expect(result.current.bookings).toEqual([]);
    expect(bookingsApi.getBookingsByLaunch).not.toHaveBeenCalled();
  });

  it('loads bookings when launchId is provided', async () => {
    vi.mocked(bookingsApi.getBookingsByLaunch).mockResolvedValue([mockBooking]);

    const { result } = renderHook(() => useBookings('launch-1'));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.bookings).toEqual([mockBooking]);
    expect(result.current.error).toBeNull();
  });

  it('sets error when fetch fails', async () => {
    vi.mocked(bookingsApi.getBookingsByLaunch).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useBookings('launch-1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.bookings).toEqual([]);
  });

  it('refreshes the list after create', async () => {
    vi.mocked(bookingsApi.getBookingsByLaunch).mockResolvedValue([]);
    vi.mocked(bookingsApi.createBooking).mockResolvedValue(mockBooking);

    const { result } = renderHook(() => useBookings('launch-1'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    vi.mocked(bookingsApi.getBookingsByLaunch).mockResolvedValue([mockBooking]);
    await act(() =>
      result.current.create({
        passengerName: 'Ada Lovelace',
        passengerEmail: 'ada@example.com',
        passengerPhone: '+34 600 000 001',
      }),
    );

    expect(bookingsApi.createBooking).toHaveBeenCalledWith(
      'launch-1',
      expect.objectContaining({ passengerName: 'Ada Lovelace' }),
    );
    expect(result.current.bookings).toEqual([mockBooking]);
  });

  it('refreshes the list after cancel', async () => {
    const cancelled: Booking = { ...mockBooking, status: 'cancelled' };
    vi.mocked(bookingsApi.getBookingsByLaunch).mockResolvedValue([mockBooking]);
    vi.mocked(bookingsApi.cancelBooking).mockResolvedValue(cancelled);

    const { result } = renderHook(() => useBookings('launch-1'));
    await waitFor(() => expect(result.current.bookings).toEqual([mockBooking]));

    vi.mocked(bookingsApi.getBookingsByLaunch).mockResolvedValue([cancelled]);
    await act(() => result.current.cancel('booking-1'));

    expect(bookingsApi.cancelBooking).toHaveBeenCalledWith('booking-1');
    expect(result.current.bookings).toEqual([cancelled]);
  });
});
