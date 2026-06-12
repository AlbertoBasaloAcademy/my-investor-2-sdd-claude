import { useCallback, useEffect, useState } from 'react';
import { cancelBooking, createBooking, getBookingsByLaunch } from './bookingsApi';
import type { Booking, BookingRequest } from '../../shared/types/bookings';

interface FetchResult {
  launchId: string;
  bookings?: Booking[];
  error?: string;
}

export function useBookings(launchId: string | null) {
  const [result, setResult] = useState<FetchResult | null>(null);

  useEffect(() => {
    if (!launchId) return;

    let active = true;

    getBookingsByLaunch(launchId)
      .then((data) => {
        if (active) setResult({ launchId, bookings: data });
      })
      .catch((cause: unknown) => {
        if (active) setResult({ launchId, error: cause instanceof Error ? cause.message : String(cause) });
      });

    return () => {
      active = false;
    };
  }, [launchId]);

  // Only the result for the currently selected launch counts; stale results read as empty.
  const current = result && result.launchId === launchId ? result : null;
  const bookings = current?.bookings ?? [];
  const error = current?.error ?? null;
  const loading = launchId !== null && current === null;

  const create = useCallback(
    async (request: BookingRequest): Promise<void> => {
      if (!launchId) return;
      await createBooking(launchId, request);
      setResult({ launchId, bookings: await getBookingsByLaunch(launchId) });
    },
    [launchId],
  );

  const cancel = useCallback(
    async (id: string): Promise<void> => {
      await cancelBooking(id);
      if (launchId) setResult({ launchId, bookings: await getBookingsByLaunch(launchId) });
    },
    [launchId],
  );

  return { bookings, create, cancel, loading, error } as const;
}
