import { httpClient } from '../../shared/api/httpClient';
import type { Booking, BookingRequest } from '../../shared/types/bookings';

export async function getBookingsByLaunch(launchId: string): Promise<Booking[]> {
  return httpClient.get<Booking[]>(`/api/launches/${launchId}/bookings`);
}

export async function createBooking(launchId: string, request: BookingRequest): Promise<Booking> {
  return httpClient.post<Booking>(`/api/launches/${launchId}/bookings`, request);
}

export async function cancelBooking(id: string): Promise<Booking> {
  return httpClient.patch<Booking>(`/api/bookings/${id}/cancel`, {});
}
